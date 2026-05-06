"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/src/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number | null;
  stock: number | null;
}

interface CartLine {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface CatalogClientProps {
  initialProducts: Product[];
  userEmail: string;
  role: string;
  isAdmin: boolean;
}

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Blinkit colors
const YELLOW = "#FFD700";
const GREEN = "#2E7D32";
const DARK_GREEN = "#1B5E20";

export default function CatalogClient({
  initialProducts,
  userEmail,
  role,
  isAdmin,
}: CatalogClientProps) {
  const [q, setQ] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [shopName, setShopName] = useState("");
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [activeTab, setActiveTab] = useState<"catalog" | "basket">("catalog");

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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blinkit-style Header */}
      <header className="sticky top-0 z-50 bg-[#FFD700] shadow-md">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-black">Mandi Markt</span>
              <span className="text-xs font-bold bg-black text-[#FFD700] px-2 py-1 rounded">INSTANT</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isAdmin
                    ? "bg-[#2E7D32] text-white"
                    : "bg-gray-800 text-white"
                }`}
              >
                {isAdmin ? "WHOLESALER" : "RETAILER"}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-black text-[#FFD700] text-sm font-bold hover:bg-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* User info bar */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">{userEmail}</span>
        </div>

        {/* Tab buttons */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
              activeTab === "catalog"
                ? "bg-[#FFD700] text-black shadow-md"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            🛒 Browse Products
          </button>
          <button
            onClick={() => setActiveTab("basket")}
            className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
              activeTab === "basket"
                ? "bg-[#FFD700] text-black shadow-md"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            🧺 Basket {lines.length > 0 && `(${lines.length})`}
          </button>
        </div>

        {/* Catalog Tab */}
        {activeTab === "catalog" && (
          <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
            {/* Products List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Search bar */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <input
                    id="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    autoFocus
                    placeholder="Search for products..."
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 pl-11 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#FFD700] focus:bg-white"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
                </div>
              </div>

              {/* Products grid */}
              <div className="p-4">
                {filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-500">No items match &quot;{q}&quot;</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {filtered.map((p) => {
                      const price = p.price ?? null;
                      const canAdd = price != null && price > 0;
                      const inCart = cart[String(p.id)];
                      
                      return (
                        <div
                          key={String(p.id)}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            inCart 
                              ? "border-[#FFD700] bg-[#FFF8E1]" 
                              : "border-gray-100 bg-white hover:border-gray-200"
                          }`}
                        >
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xl font-black text-[#2E7D32]">
                                {price == null ? "—" : formatINR(price)}
                              </span>
                              <span className="text-sm text-gray-500">
                                Stock: {p.stock ?? "—"}
                              </span>
                            </div>
                          </div>
                          
                          {inCart ? (
                            <div className="flex items-center gap-2">
                              <button
                                className="h-10 w-10 rounded-lg border-2 border-gray-300 bg-white text-lg font-bold text-gray-600 hover:border-[#FFD700]"
                                onClick={() => setQty(inCart.id, inCart.qty - 1)}
                              >
                                −
                              </button>
                              <span className="w-8 text-center font-bold text-lg">{inCart.qty}</span>
                              <button
                                className="h-10 w-10 rounded-lg bg-[#FFD700] text-lg font-bold text-black hover:bg-[#FFC107]"
                                onClick={() => setQty(inCart.id, inCart.qty + 1)}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={!canAdd}
                              onClick={() => addOne(p)}
                              className="px-6 py-2.5 rounded-xl bg-[#FFD700] text-black font-bold hover:bg-[#FFC107] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              ADD
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold text-gray-900">{filtered.length}</span> products
                </p>
              </div>
            </div>

            {/* Basket Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 h-fit sticky top-24">
              <h3 className="text-xl font-black text-gray-900 mb-1">Your Basket</h3>
              <p className="text-gray-500 text-sm mb-4">
                {lines.length === 0 ? "Add items to get started" : `${lines.length} items added`}
              </p>

              {lines.length > 0 && (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {lines.map((l) => (
                      <div key={l.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-bold text-gray-900">{l.name}</p>
                          <p className="text-sm text-gray-600">{formatINR(l.price)} × {l.qty}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="h-8 w-8 rounded-lg border border-gray-300 bg-white text-sm font-bold text-gray-600"
                            onClick={() => setQty(l.id, l.qty - 1)}
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-bold">{l.qty}</span>
                          <button
                            className="h-8 w-8 rounded-lg bg-[#FFD700] text-sm font-bold text-black"
                            onClick={() => setQty(l.id, l.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Total</span>
                      <span className="text-2xl font-black text-[#2E7D32]">{formatINR(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("basket")}
                    className="w-full py-3 rounded-xl bg-[#2E7D32] text-white font-bold hover:bg-[#1B5E20] active:scale-95 transition-all"
                  >
                    View Basket →
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Basket Tab */}
        {activeTab === "basket" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-1">Review Basket</h2>
              <p className="text-gray-500 mb-6">Complete your order details</p>

              {/* Customer details */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="buyerName">
                    Buyer Name (Optional)
                  </label>
                  <input
                    id="buyerName"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Enter buyer name"
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#FFD700] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="shopName">
                    Shop Name (Optional)
                  </label>
                  <input
                    id="shopName"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Enter shop name"
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#FFD700] focus:bg-white"
                  />
                </div>
              </div>

              {/* Items list */}
              <div className="border-t border-gray-200 py-4">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Items ({lines.length})</h3>
                
                {lines.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Your basket is empty</p>
                ) : (
                  <div className="space-y-3">
                    {lines.map((l) => (
                      <div key={l.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-bold text-gray-900">{l.name}</p>
                          <p className="text-sm text-gray-600">{formatINR(l.price)} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            className="h-10 w-10 rounded-lg border-2 border-gray-300 bg-white text-lg font-bold text-gray-600 hover:border-[#FFD700]"
                            onClick={() => setQty(l.id, l.qty - 1)}
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-bold text-lg">{l.qty}</span>
                          <button
                            className="h-10 w-10 rounded-lg bg-[#FFD700] text-lg font-bold text-black hover:bg-[#FFC107]"
                            onClick={() => setQty(l.id, l.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-3xl font-black text-[#2E7D32]">{formatINR(total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  disabled={lines.length === 0}
                  onClick={() => {
                    const rows = lines
                      .map(
                        (l, i) =>
                          `<tr style="background:${i % 2 === 0 ? "#fff" : "#fafafa"}"><td style="padding:8px 10px;border-bottom:1px solid #eee">${i + 1}. ${l.name}</td><td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center">${l.qty}</td><td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:800">₹${l.price * l.qty}</td></tr>`,
                      )
                      .join("");
                    const date = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Mandi Markt Bill</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:18px;color:#0d1117}.hdr{text-align:center;border-bottom:3px solid #FFD700;padding-bottom:12px;margin-bottom:12px}.brand{font-size:28px;font-weight:900;color:#000}.sub{margin-top:6px;font-size:12px;color:#666}.info{background:#f6f6f6;border:1px solid #eee;border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:12px}.ir{display:flex;justify-content:space-between;gap:10px;margin-bottom:6px}.il{color:#555;font-weight:700}.iv{font-weight:800;text-align:right}table{width:100%;border-collapse:collapse}thead{background:#FFD700;color:#000}thead th{padding:9px 10px;font-size:11px;font-weight:900;text-transform:uppercase}thead th:last-child{text-align:right}thead th:nth-child(2){text-align:center}.tot{background:#2E7D32;color:#fff}.tot td{padding:10px;font-size:15px;font-weight:900}.tot td:last-child{text-align:right;font-size:18px}.ftr{text-align:center;margin-top:14px;font-size:11px;color:#888;border-top:1px dashed #ddd;padding-top:10px}@media print{button{display:none!important}}</style></head><body><div class="hdr"><div class="brand">Mandi Markt</div><div class="sub">Instant Wholesale</div></div><div class="info"><div class="ir"><span class="il">Buyer name</span><span class="iv">${buyerName || "—"}</span></div><div class="ir"><span class="il">Shop</span><span class="iv">${shopName || "—"}</span></div><div class="ir"><span class="il">Date</span><span class="iv">${date}</span></div></div><table><thead><tr><th style="text-align:left">Item</th><th>Qty</th><th>Amount</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="tot"><td colspan="2">TOTAL</td><td>₹${total}</td></tr></tfoot></table><div class="ftr">Thank you for shopping with Mandi Markt!</div><script>window.onload=()=>window.print();</script></body></html>`;
                    const w = window.open("", "_blank", "width=480,height=700");
                    if (w) {
                      w.document.write(html);
                      w.document.close();
                    }
                  }}
                  className="w-full py-4 rounded-xl bg-[#FFD700] text-black font-black text-lg hover:bg-[#FFC107] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  🖨️ Print Bill
                </button>

                <button
                  disabled={lines.length === 0}
                  onClick={() => setCart({})}
                  className="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-40"
                >
                  Clear Basket
                </button>

                <button
                  onClick={() => setActiveTab("catalog")}
                  className="w-full py-3 rounded-xl bg-[#2E7D32] text-white font-bold hover:bg-[#1B5E20]"
                >
                  ← Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
