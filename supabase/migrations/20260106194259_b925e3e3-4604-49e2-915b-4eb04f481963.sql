-- Product UOM Conversions
CREATE TABLE public.product_uom (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  uom_name TEXT NOT NULL, -- e.g., 'piece', 'box', 'case', 'pack'
  conversion_factor NUMERIC NOT NULL DEFAULT 1, -- e.g., 1 case = 12 pieces, factor = 12
  is_base_unit BOOLEAN NOT NULL DEFAULT false, -- the smallest unit
  is_purchase_unit BOOLEAN NOT NULL DEFAULT false, -- default for purchasing
  is_sales_unit BOOLEAN NOT NULL DEFAULT false, -- default for sales
  barcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_uom ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view product UOM" ON public.product_uom
  FOR SELECT USING (true);

CREATE POLICY "Managers can manage product UOM" ON public.product_uom
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE INDEX idx_product_uom_product ON public.product_uom(product_id);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, error, success
  category TEXT, -- stock, approval, order, system
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- Scheduled Reports
CREATE TABLE public.scheduled_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- sales, inventory, receivables, payables, petty_cash
  schedule_type TEXT NOT NULL, -- daily, weekly, monthly
  schedule_day INTEGER, -- 0-6 for weekly (Sun-Sat), 1-31 for monthly
  schedule_time TIME NOT NULL DEFAULT '08:00:00',
  recipients TEXT[] NOT NULL, -- email addresses
  filters JSONB DEFAULT '{}', -- date range, branch, etc.
  format TEXT NOT NULL DEFAULT 'csv', -- csv, pdf
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view scheduled reports" ON public.scheduled_reports
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can manage scheduled reports" ON public.scheduled_reports
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Stock Locations (Bin/Rack/Shelf)
CREATE TABLE public.stock_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  zone TEXT, -- e.g., 'A', 'B', 'Warehouse', 'Showroom'
  aisle TEXT, -- e.g., '01', '02'
  rack TEXT, -- e.g., 'R1', 'R2'
  shelf TEXT, -- e.g., 'S1', 'S2'
  bin TEXT, -- e.g., 'B1', 'B2'
  location_code TEXT NOT NULL, -- auto-generated or manual: 'A-01-R1-S2-B3'
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view stock locations" ON public.stock_locations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can manage stock locations" ON public.stock_locations
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE UNIQUE INDEX idx_stock_locations_code ON public.stock_locations(branch_id, location_code);

-- Product Stock Location mapping
CREATE TABLE public.product_stock_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.stock_locations(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_stock_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view product locations" ON public.product_stock_locations
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'cashier'));

CREATE POLICY "Managers can manage product locations" ON public.product_stock_locations
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE UNIQUE INDEX idx_product_stock_location ON public.product_stock_locations(product_id, location_id);

-- Supplier Invoices (for payables tracking)
CREATE TABLE public.supplier_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  grn_id UUID REFERENCES public.grn(id),
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid', -- unpaid, partial, paid
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view supplier invoices" ON public.supplier_invoices
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can manage supplier invoices" ON public.supplier_invoices
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE INDEX idx_supplier_invoices_supplier ON public.supplier_invoices(supplier_id);
CREATE INDEX idx_supplier_invoices_status ON public.supplier_invoices(status, due_date);

-- Supplier Payments
CREATE TABLE public.supplier_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_invoice_id UUID NOT NULL REFERENCES public.supplier_invoices(id) ON DELETE RESTRICT,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view supplier payments" ON public.supplier_payments
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can manage supplier payments" ON public.supplier_payments
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE INDEX idx_supplier_payments_invoice ON public.supplier_payments(supplier_invoice_id);

-- Trigger to update supplier invoice paid amount
CREATE OR REPLACE FUNCTION public.update_supplier_invoice_paid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.supplier_invoices
  SET 
    paid_amount = COALESCE((
      SELECT SUM(amount) FROM public.supplier_payments 
      WHERE supplier_invoice_id = COALESCE(NEW.supplier_invoice_id, OLD.supplier_invoice_id)
    ), 0),
    status = CASE 
      WHEN COALESCE((
        SELECT SUM(amount) FROM public.supplier_payments 
        WHERE supplier_invoice_id = COALESCE(NEW.supplier_invoice_id, OLD.supplier_invoice_id)
      ), 0) >= total_amount THEN 'paid'
      WHEN COALESCE((
        SELECT SUM(amount) FROM public.supplier_payments 
        WHERE supplier_invoice_id = COALESCE(NEW.supplier_invoice_id, OLD.supplier_invoice_id)
      ), 0) > 0 THEN 'partial'
      ELSE 'unpaid'
    END,
    updated_at = now()
  WHERE id = COALESCE(NEW.supplier_invoice_id, OLD.supplier_invoice_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_supplier_invoice_paid_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.supplier_payments
FOR EACH ROW EXECUTE FUNCTION public.update_supplier_invoice_paid();