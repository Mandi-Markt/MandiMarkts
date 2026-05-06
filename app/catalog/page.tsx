import { supabaseServer } from "@/src/supabase/server";
import CatalogClient from "./CatalogClient";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const supabase = supabaseServer();

  // Get current user session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return (
      <div className="min-h-screen bg-green-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-lime-300">Mandi Markt</h1>
          <p className="mt-4 text-green-100">Please sign in to access the catalog.</p>
          <a
            href="/login"
            className="mt-6 inline-block rounded-xl bg-lime-400 px-6 py-3 text-xl font-extrabold text-green-950 hover:bg-lime-300"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const userEmail = session.user.email ?? "";
  const isAdmin = userEmail === "raj.markts@gmail.com";
  const role = isAdmin ? "admin" : "user";

  // Get or create user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!profile) {
    // Create profile if it doesn't exist
    await supabase.from("profiles").insert({
      id: session.user.id,
      email: userEmail,
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // Fetch products
  const { data: products, error } = await supabase.from("products").select("*");

  if (error) {
    return (
      <div className="min-h-screen bg-green-950 text-green-50 px-6 py-10">
        <h1 className="text-4xl font-extrabold text-lime-300">Mandi Markt</h1>
        <p className="mt-4 text-2xl text-lime-100 font-bold">
          Could not load products: {error.message}
        </p>
      </div>
    );
  }

  const rows = (products ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id ?? row.product_id ?? row.sku ?? crypto.randomUUID()),
    name: String(row.name ?? row.item_name ?? row.product_name ?? row.title ?? "Unnamed item"),
    stock: typeof row.stock === "number" ? row.stock :
           typeof row.qty === "number" ? row.qty :
           typeof row.quantity === "number" ? row.quantity :
           typeof row.in_stock === "number" ? row.in_stock : null,
    price: typeof row.price === "number" ? row.price :
           typeof row.selling_price === "number" ? row.selling_price :
           typeof row.retail_price === "number" ? row.retail_price :
           typeof row.mrp === "number" ? row.mrp : null,
  }));

  return (
    <CatalogClient
      initialProducts={rows}
      userEmail={userEmail}
      role={role}
      isAdmin={isAdmin}
    />
  );
}
