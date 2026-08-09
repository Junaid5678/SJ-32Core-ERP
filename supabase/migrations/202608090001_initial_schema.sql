-- Enable uuid generator
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper: automatically set updated_at on update
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================
-- Global: audit_logs (Audit Trail & Compliance Logs)
-- ==========================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text,
  actor text,
  action text,
  resource text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs (tenant_email);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_isolation ON audit_logs
  FOR ALL
  USING (tenant_email = auth.email() OR tenant_email IS NULL)
  WITH CHECK (tenant_email = auth.email() OR tenant_email IS NULL);

-- ==========================
-- 1. SaaS Subscription
-- ==========================
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  plan text NOT NULL,
  status text,
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions (tenant_email);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_tenant_isolation ON subscriptions
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ==========================
-- 2. AI Quota
-- ==========================
CREATE TABLE IF NOT EXISTS ai_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  model text,
  quota_limit integer DEFAULT 0,
  quota_used integer DEFAULT 0,
  reset_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_quotas_tenant ON ai_quotas (tenant_email);
ALTER TABLE ai_quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_quotas_tenant_isolation ON ai_quotas
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_ai_quotas_updated_at BEFORE UPDATE ON ai_quotas FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ==========================
-- 3. Inventory & BOM
-- ==========================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  sku text,
  name text NOT NULL,
  description text,
  uom text,
  price numeric,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products (tenant_email);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_tenant_isolation ON products
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS product_boms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  components jsonb, -- [{component_id, qty, uom}, ...]
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_boms_tenant ON product_boms (tenant_email);
ALTER TABLE product_boms ENABLE ROW LEVEL SECURITY;
CREATE POLICY boms_tenant_isolation ON product_boms
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_boms_updated_at BEFORE UPDATE ON product_boms FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  name text,
  location text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_warehouses_tenant ON warehouses (tenant_email);
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY warehouses_tenant_isolation ON warehouses
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS inventory_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE SET NULL,
  qty numeric DEFAULT 0,
  reserved numeric DEFAULT 0,
  min_level numeric DEFAULT 0,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inventory_tenant ON inventory_levels (tenant_email);
ALTER TABLE inventory_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY inventory_tenant_isolation ON inventory_levels
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_inventory_updated_at BEFORE UPDATE ON inventory_levels FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ==========================
-- 4. POS & Orders
-- ==========================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  reference text,
  customer_id uuid,
  status text, -- pending|paid|cancelled|refunded
  total_amount numeric,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders (tenant_email);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_tenant_isolation ON orders
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS order_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  qty numeric,
  unit_price numeric,
  discount numeric DEFAULT 0,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_lines_tenant ON order_lines (tenant_email);
ALTER TABLE order_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_lines_tenant_isolation ON order_lines
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  order_id uuid REFERENCES orders(id),
  amount numeric,
  method text,
  status text, -- pending|completed|failed
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments (tenant_email);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_tenant_isolation ON payments
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 5. Accounting Ledger
-- ==========================
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  code text,
  name text,
  type text, -- asset|liability|equity|revenue|expense
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_accounts_tenant ON accounts (tenant_email);
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY accounts_tenant_isolation ON accounts
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  account_id uuid REFERENCES accounts(id),
  reference text,
  date date,
  debit numeric DEFAULT 0,
  credit numeric DEFAULT 0,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ledger_tenant ON ledger_entries (tenant_email);
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY ledger_tenant_isolation ON ledger_entries
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 6. RBAC (7-tier)
-- ==========================
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text, -- null for global roles, or set for tenant-specific roles
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_roles_tenant ON roles (tenant_email);
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY roles_tenant_isolation ON roles
  FOR ALL
  USING (tenant_email = auth.email() OR tenant_email IS NULL)
  WITH CHECK (tenant_email = auth.email() OR tenant_email IS NULL);

CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE, -- e.g., crm.customers.view
  description text,
  created_at timestamptz DEFAULT now()
);
-- Permissions are global; allow read for all authenticated users; restrict write to superadmins if you want
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY permissions_public ON permissions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY role_permissions_tenant_isolation ON role_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM roles r WHERE r.id = role_permissions.role_id AND (r.tenant_email = auth.email() OR r.tenant_email IS NULL)
    )
  )
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  user_email text NOT NULL,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant ON user_roles (tenant_email);
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_roles_tenant_isolation ON user_roles
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 7. Logistics (shipments, transfer_orders, branch transfers)
-- ==========================
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  reference text,
  status text,
  origin text,
  destination text,
  carrier text,
  tracking text,
  weight numeric,
  items jsonb,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shipments_tenant ON shipments (tenant_email);
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY shipments_tenant_isolation ON shipments
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS transfer_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  reference text,
  from_warehouse uuid,
  to_warehouse uuid,
  status text,
  lines jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transfer_orders_tenant ON transfer_orders (tenant_email);
ALTER TABLE transfer_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY transfer_orders_tenant_isolation ON transfer_orders
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_transfer_orders_updated_at BEFORE UPDATE ON transfer_orders FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS branch_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  from_branch text,
  to_branch text,
  reference text,
  status text,
  lines jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_branch_transfers_tenant ON branch_transfers (tenant_email);
ALTER TABLE branch_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_transfers_tenant_isolation ON branch_transfers
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_branch_transfers_updated_at BEFORE UPDATE ON branch_transfers FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ==========================
-- 8. CRM (customers & leads)
-- ==========================
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers (tenant_email);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customers_tenant_isolation ON customers
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  name text,
  email text,
  phone text,
  status text,
  owner text,
  source text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_tenant ON leads (tenant_email);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY leads_tenant_isolation ON leads
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 9. HRM / Payroll
-- ==========================
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  first_name text,
  last_name text,
  email text,
  phone text,
  role text,
  status text,
  salary numeric,
  payroll_info jsonb,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees (tenant_email);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY employees_tenant_isolation ON employees
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS payroll_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  period_start date,
  period_end date,
  totals jsonb,
  status text,
  created_at timestamptz DEFAULT now(),
  finalized_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_payroll_tenant ON payroll_runs (tenant_email);
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY payroll_tenant_isolation ON payroll_runs
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

CREATE TABLE IF NOT EXISTS payroll_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  payroll_run_id uuid REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id),
  gross numeric,
  deductions jsonb,
  net numeric,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payroll_lines_tenant ON payroll_lines (tenant_email);
ALTER TABLE payroll_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY payroll_lines_tenant_isolation ON payroll_lines
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 10. Procurement (suppliers, purchase orders)
-- ==========================
CREATE TABLE IF NOT EXISTS suppliers (
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
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant ON suppliers (tenant_email);
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY suppliers_tenant_isolation ON suppliers
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  supplier_id uuid REFERENCES suppliers(id),
  reference text,
  status text,
  total_amount numeric,
  lines jsonb,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_po_tenant ON purchase_orders (tenant_email);
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY po_tenant_isolation ON purchase_orders
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ==========================
-- 11. MRP / Manufacturing (work orders, production batches)
-- ==========================
CREATE TABLE IF NOT EXISTS work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  reference text,
  product_id uuid REFERENCES products(id),
  qty numeric,
  status text,
  operations jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_work_orders_tenant ON work_orders (tenant_email);
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY work_orders_tenant_isolation ON work_orders
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS production_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE,
  batch_number text,
  qty numeric,
  status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_batches_tenant ON production_batches (tenant_email);
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY batches_tenant_isolation ON production_batches
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_batches_updated_at BEFORE UPDATE ON production_batches FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ==========================
-- 12. Vendor Ledger
-- ==========================
CREATE TABLE IF NOT EXISTS vendor_ledgers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  supplier_id uuid,
  reference text,
  date date,
  debit numeric DEFAULT 0,
  credit numeric,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vendor_ledgers_tenant ON vendor_ledgers (tenant_email);
ALTER TABLE vendor_ledgers ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendor_ledgers_tenant_isolation ON vendor_ledgers
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 13. Customer Receivables / Invoices
-- ==========================
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  reference text,
  customer_id uuid,
  status text,
  total_amount numeric,
  due_date date,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices (tenant_email);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoices_tenant_isolation ON invoices
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  product_id uuid,
  description text,
  qty numeric,
  unit_price numeric,
  total numeric,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_tenant ON invoice_lines (tenant_email);
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoice_lines_tenant_isolation ON invoice_lines
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

CREATE TABLE IF NOT EXISTS receivables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  invoice_id uuid REFERENCES invoices(id),
  customer_id uuid,
  amount numeric,
  status text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_receivables_tenant ON receivables (tenant_email);
ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;
CREATE POLICY receivables_tenant_isolation ON receivables
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 14. Barcode Scanner & Devices
-- ==========================
CREATE TABLE IF NOT EXISTS scanned_barcodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  device_id uuid,
  barcode text,
  scanned_at timestamptz DEFAULT now(),
  metadata jsonb
);
CREATE INDEX IF NOT EXISTS idx_scanned_barcodes_tenant ON scanned_barcodes (tenant_email);
ALTER TABLE scanned_barcodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY scanned_barcodes_tenant_isolation ON scanned_barcodes
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

CREATE TABLE IF NOT EXISTS pos_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  name text,
  type text,
  status text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pos_devices_tenant ON pos_devices (tenant_email);
ALTER TABLE pos_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY pos_devices_tenant_isolation ON pos_devices
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_pos_devices_updated_at BEFORE UPDATE ON pos_devices FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ==========================
-- 15. Tax Compliance
-- ==========================
CREATE TABLE IF NOT EXISTS tax_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  name text,
  rate numeric,
  jurisdiction text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tax_rates_tenant ON tax_rates (tenant_email);
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY tax_rates_tenant_isolation ON tax_rates
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_tax_rates_updated_at BEFORE UPDATE ON tax_rates FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS tax_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  period_start date,
  period_end date,
  totals jsonb,
  status text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tax_reports_tenant ON tax_reports (tenant_email);
ALTER TABLE tax_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY tax_reports_tenant_isolation ON tax_reports
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 16. Expense Management
-- ==========================
CREATE TABLE IF NOT EXISTS expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  name text,
  description text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_expense_categories_tenant ON expense_categories (tenant_email);
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY expense_categories_tenant_isolation ON expense_categories
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  reference text,
  category_id uuid REFERENCES expense_categories(id),
  amount numeric,
  currency text,
  date date,
  notes text,
  receipt_url text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_expenses_tenant ON expenses (tenant_email);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY expenses_tenant_isolation ON expenses
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 17. Notifications (In-app and Email), Notification Audit & Retry
-- ==========================
CREATE TABLE IF NOT EXISTS notification_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  type text, -- email|in_app|webhook|sms
  config jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notification_channels_tenant ON notification_channels (tenant_email);
ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_channels_tenant_isolation ON notification_channels
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_notification_channels_updated_at BEFORE UPDATE ON notification_channels FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  channel_id uuid,
  recipient text,
  subject text,
  body text,
  status text, -- queued|sent|failed
  meta jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications (tenant_email);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_tenant_isolation ON notifications
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

CREATE TABLE IF NOT EXISTS notification_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  notification_id uuid REFERENCES notifications(id),
  attempt integer DEFAULT 0,
  status text,
  response jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notification_audit_tenant ON notification_audit (tenant_email);
ALTER TABLE notification_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_audit_tenant_isolation ON notification_audit
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 18. Backup & Restore
-- ==========================
CREATE TABLE IF NOT EXISTS backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  type text, -- full|partial
  storage_path text,
  size_bytes bigint,
  status text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_backups_tenant ON backups (tenant_email);
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY backups_tenant_isolation ON backups
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 19. API / Webhooks Manager
-- ==========================
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
CREATE POLICY webhooks_tenant_isolation ON webhooks
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  webhook_id uuid REFERENCES webhooks(id),
  payload jsonb,
  status text,
  response jsonb,
  attempt integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_tenant ON webhook_deliveries (tenant_email);
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhook_deliveries_tenant_isolation ON webhook_deliveries
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 20. Asset Management (fixed assets)
-- ==========================
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  tag text,
  name text,
  description text,
  purchase_date date,
  cost numeric,
  depreciation jsonb,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assets_tenant ON assets (tenant_email);
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY assets_tenant_isolation ON assets
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS asset_depreciations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  asset_id uuid REFERENCES assets(id),
  period_start date,
  period_end date,
  amount numeric,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_asset_depr_tenant ON asset_depreciations (tenant_email);
ALTER TABLE asset_depreciations ENABLE ROW LEVEL SECURITY;
CREATE POLICY asset_depr_tenant_isolation ON asset_depreciations
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 21. POS Hardware Bridge
-- ==========================
CREATE TABLE IF NOT EXISTS pos_hardware_bridges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  device_id uuid,
  bridge_type text, -- usb|network|serial
  config jsonb,
  status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pos_hardware_tenant ON pos_hardware_bridges (tenant_email);
ALTER TABLE pos_hardware_bridges ENABLE ROW LEVEL SECURITY;
CREATE POLICY pos_hardware_tenant_isolation ON pos_hardware_bridges
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_pos_hardware_updated_at BEFORE UPDATE ON pos_hardware_bridges FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ==========================
-- 22. Returns & Refunds
-- ==========================
CREATE TABLE IF NOT EXISTS returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  order_id uuid REFERENCES orders(id),
  reference text,
  status text,
  reason text,
  lines jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_returns_tenant ON returns (tenant_email);
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
CREATE POLICY returns_tenant_isolation ON returns
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_returns_updated_at BEFORE UPDATE ON returns FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  return_id uuid REFERENCES returns(id),
  amount numeric,
  method text,
  status text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_refunds_tenant ON refunds (tenant_email);
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY refunds_tenant_isolation ON refunds
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 23. Discounts & Promotions
-- ==========================
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  name text,
  code text,
  type text, -- percentage|fixed|bogo
  value numeric,
  start_at timestamptz,
  end_at timestamptz,
  rules jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_promotions_tenant ON promotions (tenant_email);
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY promotions_tenant_isolation ON promotions
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ==========================
-- 24. Shift / Cash Drawer
-- ==========================
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  user_email text,
  started_at timestamptz,
  ended_at timestamptz,
  status text,
  totals jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shifts_tenant ON shifts (tenant_email);
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY shifts_tenant_isolation ON shifts
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

CREATE TABLE IF NOT EXISTS cash_drawers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  shift_id uuid REFERENCES shifts(id),
  starting_amount numeric,
  ending_amount numeric,
  transactions jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cash_drawers_tenant ON cash_drawers (tenant_email);
ALTER TABLE cash_drawers ENABLE ROW LEVEL SECURITY;
CREATE POLICY cash_drawers_tenant_isolation ON cash_drawers
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_cash_drawers_updated_at BEFORE UPDATE ON cash_drawers FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ==========================
-- 25. Quality Control (QC)
-- ==========================
CREATE TABLE IF NOT EXISTS qc_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  reference text,
  product_id uuid,
  inspector text,
  status text,
  results jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_qc_tenant ON qc_inspections (tenant_email);
ALTER TABLE qc_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY qc_tenant_isolation ON qc_inspections
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_qc_updated_at BEFORE UPDATE ON qc_inspections FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS qc_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  name text,
  items jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_qc_checklists_tenant ON qc_checklists (tenant_email);
ALTER TABLE qc_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY qc_checklists_tenant_isolation ON qc_checklists
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 26. Document & Invoice Generation
-- ==========================
CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  name text,
  type text, -- invoice|report|certificate
  content text, -- HTML/template
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_document_templates_tenant ON document_templates (tenant_email);
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY document_templates_tenant_isolation ON document_templates
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_document_templates_updated_at BEFORE UPDATE ON document_templates FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  template_id uuid REFERENCES document_templates(id),
  reference text,
  data jsonb,
  pdf_url text,
  status text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents (tenant_email);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_tenant_isolation ON documents
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 27. BI Analytics
-- ==========================
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  event_name text,
  payload jsonb,
  occurred_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_analytics_tenant ON analytics_events (tenant_email);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_tenant_isolation ON analytics_events
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

CREATE TABLE IF NOT EXISTS dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  name text,
  config jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dashboards_tenant ON dashboards (tenant_email);
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY dashboards_tenant_isolation ON dashboards
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());
CREATE TRIGGER trg_dashboards_updated_at BEFORE UPDATE ON dashboards FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ==========================
-- 28. Security / Anti-Fraud
-- ==========================
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text,
  user_email text,
  event_type text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_security_events_tenant ON security_events (tenant_email);
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY security_events_tenant_isolation ON security_events
  FOR ALL
  USING (tenant_email = auth.email() OR tenant_email IS NULL)
  WITH CHECK (tenant_email = auth.email() OR tenant_email IS NULL);

CREATE TABLE IF NOT EXISTS fraud_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_email text NOT NULL,
  reference text,
  risk_score numeric,
  details jsonb,
  status text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_tenant ON fraud_alerts (tenant_email);
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY fraud_alerts_tenant_isolation ON fraud_alerts
  FOR ALL
  USING (tenant_email = auth.email())
  WITH CHECK (tenant_email = auth.email());

-- ==========================
-- 29. API Misc & support tables (e.g., webhook deliveries already created)
-- ==========================

-- ==========================
-- 30. POS Hardware Bridge & related (already created pos_hardware_bridges, pos_devices)
-- ==========================

-- ==========================
-- 31. Notifications audit & webhook deliveries (already created above)
-- ==========================

-- ==========================
-- 32. Final housekeeping: ensure triggers are present for updated_at fields
-- (Note: triggers were created individually per table above where appropriate)
-- ==========================

-- Optional: Insert baseline permissions (examples) - adapt as needed
INSERT INTO permissions (id, name, description) VALUES
  (gen_random_uuid(), 'crm.customers.view', 'View customers') ON CONFLICT DO NOTHING;
INSERT INTO permissions (id, name, description) VALUES
  (gen_random_uuid(), 'crm.customers.create', 'Create customers') ON CONFLICT DO NOTHING;
INSERT INTO permissions (id, name, description) VALUES
  (gen_random_uuid(), 'hrm.payroll.run', 'Run payroll') ON CONFLICT DO NOTHING;

-- Done
