import InventoryClient from "./InventoryClient";
import { supabaseServer } from "@/src/supabase/server";

export const dynamic = "force-dynamic";

type AnyRow = Record<string, unknown>;

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

export default async function InventoryPage() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white px-6 py-10">
        <h1 className="text-4xl font-extrabold">Inventory</h1>
        <p className="mt-4 text-2xl text-red-300 font-bold">
          Failed to load products: {error.message}
        </p>
        <p className="mt-4 text-xl text-zinc-200">
          Check your Supabase env vars and table/column names.
        </p>
      </div>
    );
  }

  const rows = (data ?? []) as AnyRow[];

  const normalized = rows
    .map((row) => {
      const id =
        pickFirst<string | number>(row, ["id", "product_id", "sku", "code"]) ??
        crypto.randomUUID();

      const name =
        pickFirst<string>(row, ["name", "item_name", "product_name", "title"]) ??
        "Unnamed item";

      const stock = toNumber(pickFirst(row, ["stock", "qty", "quantity", "in_stock"]));

      const price = toNumber(pickFirst(row, ["price", "selling_price", "retail_price", "mrp"]));

      return { id, name, stock, price };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return <InventoryClient initialItems={normalized} />;
}

