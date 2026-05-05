import InventoryClient from "./InventoryClient";
import { supabaseServer } from "@/src/supabase/server";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string | number;
  name: string;
  stock: number | null;
  retail_price: number | null;
  wholesale_price: number | null;
};

export default async function InventoryPage() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("products")
    .select("id,name,stock,retail_price,wholesale_price")
    .order("name", { ascending: true });

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

  return <InventoryClient initialItems={(data ?? []) as ProductRow[]} />;
}

