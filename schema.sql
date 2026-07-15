-- Restaurant Ordering System — Supabase/Postgres schema
-- Run this top-to-bottom on a fresh Supabase project to recreate the database
-- used by Server/Database.js.
--
-- RLS is intentionally left disabled below (matches the original MySQL setup,
-- which had no auth layer). Once auth is added, enable RLS on both tables and
-- replace the "open access" note with real policies:
--   ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
--   ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tables
-- ============================================================

CREATE TABLE orders (
  order_num    SERIAL PRIMARY KEY,
  status       TEXT NOT NULL DEFAULT 'Pending'
               CHECK (status IN ('Pending', 'Preparing', 'Completed', 'Delayed')),
  total_price  NUMERIC(10,2) NOT NULL,
  note         TEXT,
  created_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_time TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id         SERIAL PRIMARY KEY,
  order_num  INTEGER NOT NULL REFERENCES orders(order_num) ON DELETE CASCADE,
  item_id    INTEGER NOT NULL,
  item_name  TEXT NOT NULL,
  quantity   INTEGER NOT NULL,
  price      NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_order_items_order_num ON order_items(order_num);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_time ON orders(created_time);

-- ============================================================
-- Triggers
-- ============================================================

-- Mirrors MySQL's ON UPDATE CURRENT_TIMESTAMP: keeps updated_time current
-- on every row change. The kitchen/kiosk frontends use this for status timers.
CREATE OR REPLACE FUNCTION set_updated_time()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_time = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_set_updated_time
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_time();

-- ============================================================
-- Dashboard / analytics functions (called via supabase.rpc(...))
-- ============================================================

CREATE OR REPLACE FUNCTION get_total_sales()
RETURNS NUMERIC LANGUAGE sql STABLE AS $$
  SELECT SUM(total_price) FROM orders;
$$;

CREATE OR REPLACE FUNCTION get_sales_by_date(p_date DATE)
RETURNS NUMERIC LANGUAGE sql STABLE AS $$
  SELECT SUM(total_price) FROM orders
  WHERE (created_time AT TIME ZONE 'America/New_York')::date = p_date;
$$;

CREATE OR REPLACE FUNCTION get_num_of_orders_by_date(p_date DATE)
RETURNS BIGINT LANGUAGE sql STABLE AS $$
  SELECT COUNT(*) FROM orders WHERE created_time::date = p_date;
$$;

CREATE OR REPLACE FUNCTION get_total_sales_by_item()
RETURNS TABLE(item_id INTEGER, name TEXT, amount NUMERIC, quantity BIGINT, "amountShare" TEXT, "quantityShare" NUMERIC)
LANGUAGE sql STABLE AS $$
  WITH totals AS (
    SELECT SUM(price) AS total_amount, SUM(quantity) AS total_quantity FROM order_items
  ),
  item_shares AS (
    SELECT oi.item_id, oi.item_name AS name, SUM(oi.price) AS amount, SUM(oi.quantity) AS quantity
    FROM order_items oi
    GROUP BY oi.item_id, oi.item_name
  )
  SELECT s.item_id, s.name, s.amount, s.quantity,
         ROUND((s.amount / t.total_amount) * 100, 2)::text || '%' AS "amountShare",
         ROUND((s.quantity / t.total_quantity) * 100, 2) AS "quantityShare"
  FROM item_shares s, totals t
  ORDER BY s.item_id;
$$;

CREATE OR REPLACE FUNCTION get_sales_by_item_by_day(p_date DATE)
RETURNS TABLE(item_id INTEGER, name TEXT, amount NUMERIC, quantity BIGINT, "amountShare" TEXT, "quantityShare" NUMERIC)
LANGUAGE sql STABLE AS $$
  WITH totals AS (
    SELECT SUM(oi.price) AS total_amount, SUM(oi.quantity) AS total_quantity
    FROM order_items oi JOIN orders o ON oi.order_num = o.order_num
    WHERE (o.created_time AT TIME ZONE 'America/New_York')::date = p_date
  ),
  item_shares AS (
    SELECT oi.item_id, oi.item_name AS name, SUM(oi.price) AS amount, SUM(oi.quantity) AS quantity
    FROM order_items oi JOIN orders o ON oi.order_num = o.order_num
    WHERE (o.created_time AT TIME ZONE 'America/New_York')::date = p_date
    GROUP BY oi.item_id, oi.item_name
  )
  SELECT s.item_id, s.name, s.amount, s.quantity,
         ROUND((s.amount / t.total_amount) * 100, 2)::text || '%' AS "amountShare",
         ROUND((s.quantity / t.total_quantity) * 100, 2) AS "quantityShare"
  FROM item_shares s, totals t;
$$;

CREATE OR REPLACE FUNCTION get_orders_by_items()
RETURNS TABLE(name TEXT, value BIGINT)
LANGUAGE sql STABLE AS $$
  SELECT item_name AS name, SUM(quantity) AS value
  FROM order_items GROUP BY item_id, item_name;
$$;

CREATE OR REPLACE FUNCTION get_orders_by_items_by_day(p_date DATE)
RETURNS TABLE(name TEXT, value BIGINT)
LANGUAGE sql STABLE AS $$
  SELECT oi.item_name AS name, SUM(oi.quantity) AS value
  FROM order_items oi JOIN orders o ON oi.order_num = o.order_num
  WHERE (o.created_time AT TIME ZONE 'America/New_York')::date = p_date
  GROUP BY oi.item_name;
$$;

CREATE OR REPLACE FUNCTION get_average_revenue_per_order()
RETURNS NUMERIC LANGUAGE sql STABLE AS $$
  SELECT ROUND(SUM(total_price) / COUNT(*), 2) FROM orders;
$$;

CREATE OR REPLACE FUNCTION get_average_order_size()
RETURNS NUMERIC LANGUAGE sql STABLE AS $$
  SELECT ROUND(AVG(order_size), 1) FROM (
    SELECT order_num, SUM(quantity) AS order_size FROM order_items GROUP BY order_num
  ) sizes;
$$;

-- Hourly order counts (08:00-23:00 local time), across all dates present
CREATE OR REPLACE FUNCTION get_hourly_info()
RETURNS TABLE(hour_range TEXT, number_of_orders BIGINT)
LANGUAGE sql STABLE AS $$
  WITH hour_range AS (
    SELECT generate_series(8, 23) AS h
  ),
  order_counts AS (
    SELECT
      (created_time AT TIME ZONE 'America/New_York')::date AS order_date,
      EXTRACT(HOUR FROM created_time AT TIME ZONE 'America/New_York')::int AS order_hour,
      COUNT(*) AS number_of_orders
    FROM orders
    WHERE EXTRACT(HOUR FROM created_time AT TIME ZONE 'America/New_York') BETWEEN 8 AND 23
    GROUP BY 1, 2
  )
  SELECT
    CONCAT(oc.order_date, ' ', LPAD(hr.h::text, 2, '0'), ':00:00') AS hour_range,
    COALESCE(oc.number_of_orders, 0) AS number_of_orders
  FROM hour_range hr
  LEFT JOIN order_counts oc ON oc.order_hour = hr.h
  ORDER BY oc.order_date, hr.h;
$$;

-- SECURITY DEFINER: TRUNCATE requires table-owner privileges, which the
-- restricted anon/authenticated roles don't have.
CREATE OR REPLACE FUNCTION clean_up_orders()
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  TRUNCATE TABLE order_items, orders RESTART IDENTITY CASCADE;
$$;

-- ============================================================
-- Grants
-- ============================================================
-- Open access for the anon/authenticated roles, since the app has no auth
-- layer yet and talks to Supabase via the publishable/anon key. Tighten this
-- (and re-enable RLS) once auth is added.

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders, order_items TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE orders_order_num_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE order_items_id_seq TO anon, authenticated;
