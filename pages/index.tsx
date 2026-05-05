import { useEffect, useMemo, useState } from "react";
import MandiMarktApp from "@/app/MandiMarktApp";
import { supabaseBrowser } from "@/src/supabase/client";

type AnyRow = Record<string, unknown>;
type Product = { id: string | number; name: string; stock: number | null; price: number | null };

function pickFirst<T>(row: AnyRow, keys: string[]): T | null {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null) return row[k] as T;
  }
  return null;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export default function HomePage() {
  const [rows, setRows] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = supabaseBrowser();
      const { data, error: queryError } = await supabase.from("products").select("*");

      if (queryError) {
        setError(queryError.message);
        return;
      }

      const normalized = ((data ?? []) as AnyRow[]).map((row) => ({
        id: pickFirst<string | number>(row, ["id", "product_id", "sku", "code"]) ?? crypto.randomUUID(),
        name: pickFirst<string>(row, ["name", "item_name", "product_name", "title"]) ?? "Unnamed item",
        stock: toNumber(pickFirst(row, ["stock", "qty", "quantity", "in_stock"])),
        price: toNumber(pickFirst(row, ["price", "selling_price", "retail_price", "mrp"])),
      }));

      setRows(normalized);
    };

    load().catch((e: unknown) => {
      setError(e instanceof Error ? e.message : "Failed to load products.");
    });
  }, []);

  const content = useMemo(() => {
    if (error) {
      return (
        <div className="min-h-screen bg-black text-white px-6 py-10">
          <h1 className="text-4xl font-extrabold">MandiMarkt</h1>
          <p className="mt-4 text-2xl text-red-300 font-bold">Failed to load products: {error}</p>
          <p className="mt-4 text-xl text-zinc-200">Check your Supabase env vars and `products` table.</p>
        </div>
      );
    }

    return <MandiMarktApp initialProducts={rows} />;
  }, [rows, error]);

  return content;
}
