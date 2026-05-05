"use client";

import { useMemo, useState } from "react";

type Product = {
  id: string | number;
  name: string;
  price: number | null;
  stock: number | null;
};

type CartLine = { id: string; name: string; price: number; qty: number };

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    value,
  );
}

function printBill(opts: { shopName?: string; buyerName?: string; lines: CartLine[]; total: number }) {
  const rows = opts.lines
    .map(
      (l, i) =>
        `<tr style="background:${i % 2 === 0 ? "#fff" : "#fafafa"}"><td style="padding:8px 10px;border-bottom:1px solid #eee">${i + 1}. ${l.name}</td><td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center">${l.qty}</td><td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:800">₹${l.price * l.qty}</td></tr>`,
    )
    .join("");

  const buyer = (opts.buyerName ?? "").trim();
  const shop = (opts.shopName ?? "").trim();
  const date = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>MandiMarkt Bill</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:18px;color:#0d1117}.hdr{text-align:center;border-bottom:2px solid #15803d;padding-bottom:12px;margin-bottom:12px}.brand{font-size:26px;font-weight:900;color:#0d1117}.sub{margin-top:6px;font-size:11px;color:#666}.info{background:#f6f6f6;border:1px solid #eee;border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:12px}.ir{display:flex;justify-content:space-between;gap:10px;margin-bottom:6px}.il{color:#555;font-weight:700}.iv{font-weight:800;text-align:right}table{width:100%;border-collapse:collapse}thead{background:#0d1117;color:#fff}thead th{padding:9px 10px;font-size:11px;font-weight:900;text-transform:uppercase}thead th:last-child{text-align:right}thead th:nth-child(2){text-align:center}.tot{background:#15803d;color:#fff}.tot td{padding:10px;font-size:15px;font-weight:900}.tot td:last-child{text-align:right;font-size:18px}.ftr{text-align:center;margin-top:14px;font-size:11px;color:#888;border-top:1px dashed #ddd;padding-top:10px}@media print{button{display:none!important}}</style></head><body><div class="hdr"><div class="brand">MandiMarkt</div><div class="sub">Simple bill</div></div><div class="info"><div class="ir"><span class="il">Buyer name</span><span class="iv">${buyer || "—"}</span></div><div class="ir"><span class="il">Shop</span><span class="iv">${shop || "—"}</span></div><div class="ir"><span class="il">Date</span><span class="iv">${date}</span></div></div><table><thead><tr><th style="text-align:left">Item</th><th>Qty</th><th>Amount</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="tot"><td colspan="2">TOTAL</td><td>₹${opts.total}</td></tr></tfoot></table><div class="ftr">Thank you.</div><script>window.onload=()=>window.print();</script></body></html>`;

  const w = window.open("", "_blank", "width=480,height=700");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

function whatsappBillUrl(opts: { shopName?: string; buyerName?: string; lines: CartLine[]; total: number }) {
  const buyer = (opts.buyerName ?? "").trim() || "-";
  const shop = (opts.shopName ?? "").trim() || "-";
  const lines = opts.lines
    .map((line, idx) => `${idx + 1}. ${line.name} x ${line.qty} = Rs. ${line.price * line.qty}`)
    .join("\n");
  const text = `MandiMarkt Bill\nBuyer: ${buyer}\nShop: ${shop}\n\n${lines}\n\nTotal: Rs. ${opts.total}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export default function MandiMarktApp({ initialProducts }: { initialProducts: Product[] }) {
  const [q, setQ] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [shopName, setShopName] = useState("");
  const [cart, setCart] = useState<Record<string, CartLine>>({});

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return initialProducts;
    return initialProducts.filter((p) => (p.name ?? "").toLowerCase().includes(s));
  }, [q, initialProducts]);

  const lines = useMemo(() => Object.values(cart), [cart]);
  const total = useMemo(() => lines.reduce((sum, l) => sum + l.price * l.qty, 0), [lines]);

  const addOne = (p: Product) => {
    const price = p.price ?? 0;
    if (!price) return;
    const id = String(p.id);
    setCart((c) => {
      const prev = c[id];
      const nextQty = (prev?.qty ?? 0) + 1;
      return { ...c, [id]: { id, name: p.name, price, qty: nextQty } };
    });
  };

  const setQty = (id: string, qty: number) => {
    setCart((c) => {
      const prev = c[id];
      if (!prev) return c;
      if (qty <= 0) {
        const n = { ...c };
        delete n[id];
        return n;
      }
      return { ...c, [id]: { ...prev, qty } };
    });
  };

  return (
    <div className="min-h-screen bg-green-950 text-green-50">
      <div className="mx-auto max-w-6xl px-5 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-lime-300">MandiMarkt</h1>
            <p className="mt-1 text-xl text-green-100">Search -&gt; add -&gt; print bill.</p>
          </div>

          <div className="w-full sm:max-w-lg">
            <label className="block text-xl font-bold mb-2" htmlFor="search">
              Search items
            </label>
            <input
              id="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
              placeholder="Type item name…"
              className="w-full rounded-xl border-2 border-lime-400 bg-green-900 px-4 py-4 text-2xl font-bold text-green-50 placeholder:text-green-200/80 outline-none focus:ring-4 focus:ring-lime-300"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr,420px]">
          <div className="rounded-2xl border-2 border-green-600 bg-green-900/70 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-green-800 text-lime-200">
                  <tr className="text-xl">
                    <th className="px-5 py-4">Item</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Add</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const price = p.price ?? null;
                    const canAdd = price != null && price > 0;
                    return (
                      <tr key={String(p.id)} className="border-t border-green-700">
                        <td className="px-5 py-5 text-2xl font-extrabold">{p.name}</td>
                        <td className="px-5 py-5 text-2xl font-bold">
                          {price == null ? "—" : formatINR(price)}
                        </td>
                        <td className="px-5 py-5 text-2xl font-bold">{p.stock ?? "—"}</td>
                        <td className="px-5 py-5">
                          <button
                            disabled={!canAdd}
                            onClick={() => addOne(p)}
                            className="inline-flex items-center justify-center rounded-xl bg-lime-400 px-5 py-4 text-xl font-extrabold text-green-950 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-300 disabled:opacity-40 disabled:hover:bg-lime-400"
                          >
                            + Add
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filtered.length === 0 && (
                    <tr>
                      <td className="px-5 py-10 text-2xl text-green-100" colSpan={4}>
                        No items match “{q}”.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-4 text-xl text-green-100 bg-green-900/50">
              Showing <span className="font-extrabold text-lime-300">{filtered.length}</span> items
            </div>
          </div>

          <div className="rounded-2xl border-2 border-green-600 bg-green-900/70 p-5">
            <div className="text-2xl font-extrabold text-lime-300">Cart</div>
            <p className="mt-1 text-xl text-green-100">Buyer can add only name on bill.</p>

            <div className="mt-4 grid gap-3">
              <div>
                <label className="block text-lg font-bold mb-2" htmlFor="buyerName">
                  Buyer name (optional)
                </label>
                <input
                  id="buyerName"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Name…"
                  className="w-full rounded-xl border-2 border-lime-400 bg-green-900 px-4 py-3 text-xl text-green-50 placeholder:text-green-200/80 outline-none focus:ring-4 focus:ring-lime-300"
                />
              </div>

              <div>
                <label className="block text-lg font-bold mb-2" htmlFor="shopName">
                  Shop name (optional)
                </label>
                <input
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Shop…"
                  className="w-full rounded-xl border-2 border-lime-400 bg-green-900 px-4 py-3 text-xl text-green-50 placeholder:text-green-200/80 outline-none focus:ring-4 focus:ring-lime-300"
                />
              </div>
            </div>

            <div className="mt-4 divide-y divide-green-700 rounded-xl border border-green-700 overflow-hidden">
              {lines.length === 0 ? (
                <div className="p-4 text-xl text-green-100">Cart is empty.</div>
              ) : (
                lines.map((l) => (
                  <div key={l.id} className="p-4 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-xl font-extrabold">{l.name}</div>
                      <div className="text-lg text-green-100">{formatINR(l.price)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="h-11 w-11 rounded-xl border border-green-500 bg-green-950 text-2xl font-extrabold"
                        onClick={() => setQty(l.id, l.qty - 1)}
                      >
                        −
                      </button>
                      <div className="w-12 text-center text-2xl font-extrabold">{l.qty}</div>
                      <button
                        className="h-11 w-11 rounded-xl bg-lime-400 text-2xl font-extrabold text-green-950"
                        onClick={() => setQty(l.id, l.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-green-800 px-4 py-3">
              <div className="text-xl font-extrabold">Total</div>
              <div className="text-2xl font-extrabold text-lime-300">{formatINR(total)}</div>
            </div>

            <div className="mt-4 grid gap-3">
              <button
                disabled={lines.length === 0}
                onClick={() => printBill({ buyerName, shopName, lines, total })}
                className="w-full rounded-xl bg-lime-400 px-5 py-4 text-xl font-extrabold text-green-950 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-300 disabled:opacity-40 disabled:hover:bg-lime-400"
              >
                Print Bill
              </button>
              <a
                aria-disabled={lines.length === 0}
                href={lines.length === 0 ? undefined : whatsappBillUrl({ buyerName, shopName, lines, total })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-xl bg-green-700 px-5 py-4 text-center text-xl font-extrabold text-lime-100 hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-lime-300 aria-disabled:pointer-events-none aria-disabled:opacity-40"
              >
                Send WhatsApp Bill
              </a>
              <button
                disabled={lines.length === 0}
                onClick={() => setCart({})}
                className="w-full rounded-xl border border-green-500 bg-green-950 px-5 py-4 text-xl font-extrabold hover:bg-green-900 disabled:opacity-40"
              >
                Clear cart
              </button>
            </div>

            <div className="mt-4 text-lg text-green-100">
              Tip: For rural use, keep 1 screen + big buttons + less typing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

