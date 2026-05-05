"use client";

import { useMemo, useState } from "react";

type Product = {
  id: string | number;
  name: string;
  stock: number | null;
  price: number | null;
};

function formatINR(value: number | null) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function whatsappUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export default function InventoryClient({ initialItems }: { initialItems: Product[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return initialItems;
    return initialItems.filter((p) => (p.name ?? "").toLowerCase().includes(s));
  }, [q, initialItems]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Inventory</h1>
            <p className="mt-2 text-xl text-zinc-200">
              Search items, check stock, and send WhatsApp bills.
            </p>
          </div>

          <div className="w-full sm:max-w-md">
            <label className="block text-xl font-bold mb-2" htmlFor="search">
              Search items
            </label>
            <input
              id="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
              placeholder="Type item name…"
              className="w-full rounded-xl border-2 border-green-700 bg-zinc-950 px-4 py-4 text-2xl font-bold outline-none focus:ring-4 focus:ring-green-500/60"
            />
          </div>
        </div>

        <div className="mt-7 rounded-2xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-900">
                <tr className="text-xl">
                  <th className="px-5 py-4">Item Name</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">WhatsApp Bill</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const price = formatINR(p.price);
                  const msg = `Item: ${p.name}\nPrice: ${price}`;

                  return (
                    <tr key={String(p.id)} className="border-t border-zinc-800">
                      <td className="px-5 py-5 text-2xl font-extrabold">{p.name}</td>
                      <td className="px-5 py-5 text-2xl font-bold">
                        {p.stock ?? "—"}
                      </td>
                      <td className="px-5 py-5 text-2xl font-bold">
                        {price}
                      </td>
                      <td className="px-5 py-5">
                        <a
                          className="inline-flex items-center justify-center rounded-xl bg-green-600 px-5 py-4 text-xl font-extrabold text-white hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/60"
                          href={whatsappUrl(msg)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp Bill
                        </a>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td className="px-5 py-10 text-2xl text-zinc-200" colSpan={4}>
                      No items match “{q}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 text-xl text-zinc-200 bg-zinc-900/40">
            Showing <span className="font-extrabold text-white">{filtered.length}</span> items
          </div>
        </div>
      </div>
    </div>
  );
}

