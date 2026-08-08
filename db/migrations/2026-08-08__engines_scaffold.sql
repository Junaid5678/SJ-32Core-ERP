-- Migrations for scaffolded engines: example tables + indexes + RLS policies

-- Note: run these in Supabase SQL editor. Adjust auth.email() usage if you're using service roles.

-- Shipments (Logistics)
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  reference text,
  status text,
  origin text,
  destination text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shipments_tenant ON shipments (tenant_email);
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_shipments ON shipments
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- CRM: customers
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  name text,
  email text,
  phone text,
  address text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers (tenant_email);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_customers ON customers
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- HRM: employees
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  first_name text,
  last_name text,
  email text,
  role text,
  payroll_info jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees (tenant_email);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_employees ON employees
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- Procurement: purchase_orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  supplier_id uuid,
  total_amount numeric,
  status text,
  lines jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_po_tenant ON purchase_orders (tenant_email);
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_po ON purchase_orders
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- Add additional engine tables as needed: assets, invoices, returns, discounts, shifts, qc_inspections, analytics_events, webhooks, backups, expenses

-- Assets (Asset Management)
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  tag text,
  description text,
  purchase_date date,
  depreciation jsonb,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assets_tenant ON assets (tenant_email);
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_assets ON assets
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- Webhooks (API/Webhooks Manager)
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  target_url text,
  event text,
  secret text,
  active boolean DEFAULT true,
  last_status jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhooks_tenant ON webhooks (tenant_email);
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_webhooks ON webhooks
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- Audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text,
  actor text,
  action text,
  resource text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs (tenant_email);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_audit ON audit_logs
  FOR ALL
  USING (tenant_email = auth.email() OR tenant_email IS NULL)
  WITH CHECK (tenant_email = auth.email() OR tenant_email IS NULL);

-- You should extend with more tables and indexes per engine. Ensure every table stores tenant_email and has an RLS policy.
