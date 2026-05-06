-- ─────────────────────────────────────────────────────────────
-- Mandi Markt: orders table migration
-- Run this in Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.orders (
  id             TEXT PRIMARY KEY,
  retailer       TEXT NOT NULL,
  phone          TEXT,
  date           TEXT,
  total          INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','dispatched','delivered','cancelled')),
  payment_type   TEXT NOT NULL DEFAULT 'cod'
                   CHECK (payment_type IN ('cod','online')),
  items          JSONB NOT NULL DEFAULT '[]',
  buyer_name     TEXT,
  buyer_shop     TEXT,
  buyer_phone    TEXT,
  buyer_address  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Index for wholesaler order list (filter by status)
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);

-- Index for retailer order history (filter by phone)
CREATE INDEX IF NOT EXISTS orders_phone_idx ON public.orders(buyer_phone);

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own orders
CREATE POLICY "Users can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can read all orders (wholesaler needs to see all)
CREATE POLICY "Authenticated users can read orders"
  ON public.orders FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated users can update status (wholesaler dispatching/delivering)
CREATE POLICY "Authenticated users can update order status"
  ON public.orders FOR UPDATE
  USING (auth.role() = 'authenticated');
