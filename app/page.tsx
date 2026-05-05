import MandiMarktApp from "@/app/MandiMarktApp";
import { supabaseServer } from "@/src/supabase/server";

export default function Home() {
  return <HomeWithData />;
}

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

async function HomeWithData() {
  const supabase = supabaseServer();

  const { data, error } = await supabase.from("products").select("*");

  const rows = ((data ?? []) as AnyRow[]).map((row) => {
    const id = pickFirst<string | number>(row, ["id", "product_id", "sku", "code"]) ?? crypto.randomUUID();
    const name = pickFirst<string>(row, ["name", "item_name", "product_name", "title"]) ?? "Unnamed item";
    const stock = toNumber(pickFirst(row, ["stock", "qty", "quantity", "in_stock"]));
    const price = toNumber(pickFirst(row, ["price", "selling_price", "retail_price", "mrp"]));
    return { id, name, stock, price };
  });

  if (error) {
    return (
      <div className="min-h-screen bg-green-950 text-green-50 px-6 py-10">
        <h1 className="text-4xl font-extrabold text-lime-300">MandiMarkt</h1>
        <p className="mt-4 text-2xl text-lime-100 font-bold">Could not load products: {error.message}</p>
        <p className="mt-4 text-xl text-green-100">Check `.env.local` keys and your `products` table.</p>
      </div>
    );
  }

  return <MandiMarktApp initialProducts={rows} />;
}
