-- Fix overly permissive RLS policies by implementing proper role-based access

-- Drop and recreate policies for customers table
DROP POLICY IF EXISTS "Auth users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Staff can manage customers" ON public.customers;

CREATE POLICY "Staff can view customers" ON public.customers
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'cashier'::app_role)
);

CREATE POLICY "Managers can insert customers" ON public.customers
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'cashier'::app_role)
);

CREATE POLICY "Managers can update customers" ON public.customers
FOR UPDATE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Admins can delete customers" ON public.customers
FOR DELETE USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Drop and recreate policies for invoices table
DROP POLICY IF EXISTS "Auth users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Staff can create invoices" ON public.invoices;
DROP POLICY IF EXISTS "Staff can update invoices" ON public.invoices;

CREATE POLICY "Staff can view invoices" ON public.invoices
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'cashier'::app_role)
);

CREATE POLICY "Cashiers can create invoices" ON public.invoices
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'cashier'::app_role)
);

CREATE POLICY "Managers can update invoices" ON public.invoices
FOR UPDATE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Drop and recreate policies for invoice_items table
DROP POLICY IF EXISTS "Auth users can view invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Staff can manage invoice items" ON public.invoice_items;

CREATE POLICY "Staff can view invoice items" ON public.invoice_items
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'cashier'::app_role)
);

CREATE POLICY "Cashiers can create invoice items" ON public.invoice_items
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'cashier'::app_role)
);

CREATE POLICY "Managers can update invoice items" ON public.invoice_items
FOR UPDATE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Admins can delete invoice items" ON public.invoice_items
FOR DELETE USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Drop and recreate policies for payments table
DROP POLICY IF EXISTS "Auth users can view payments" ON public.payments;
DROP POLICY IF EXISTS "Staff can create payments" ON public.payments;

CREATE POLICY "Staff can view payments" ON public.payments
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'cashier'::app_role)
);

CREATE POLICY "Cashiers can create payments" ON public.payments
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'cashier'::app_role)
);

-- Drop and recreate policies for GRN tables (restrict to managers/admins - contains supplier pricing)
DROP POLICY IF EXISTS "Auth users can view GRN" ON public.grn;
DROP POLICY IF EXISTS "Staff can manage GRN" ON public.grn;

CREATE POLICY "Managers can view GRN" ON public.grn
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Managers can manage GRN" ON public.grn
FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Auth users can view GRN items" ON public.grn_items;
DROP POLICY IF EXISTS "Staff can manage GRN items" ON public.grn_items;

CREATE POLICY "Managers can view GRN items" ON public.grn_items
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Managers can manage GRN items" ON public.grn_items
FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Auth users can view landed costs" ON public.grn_landed_costs;
DROP POLICY IF EXISTS "Staff can manage landed costs" ON public.grn_landed_costs;

CREATE POLICY "Managers can view landed costs" ON public.grn_landed_costs
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Managers can manage landed costs" ON public.grn_landed_costs
FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Drop and recreate policies for batches table
DROP POLICY IF EXISTS "Auth users can view batches" ON public.batches;
DROP POLICY IF EXISTS "Staff can manage batches" ON public.batches;

CREATE POLICY "Staff can view batches" ON public.batches
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'cashier'::app_role)
);

CREATE POLICY "Managers can manage batches" ON public.batches
FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Drop and recreate policies for serial_numbers table
DROP POLICY IF EXISTS "Auth users can view serials" ON public.serial_numbers;
DROP POLICY IF EXISTS "Staff can manage serials" ON public.serial_numbers;

CREATE POLICY "Staff can view serials" ON public.serial_numbers
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'cashier'::app_role)
);

CREATE POLICY "Managers can manage serials" ON public.serial_numbers
FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Drop and recreate policies for stock_levels table
DROP POLICY IF EXISTS "Auth users can view stock" ON public.stock_levels;
DROP POLICY IF EXISTS "Staff can manage stock" ON public.stock_levels;

CREATE POLICY "Staff can view stock" ON public.stock_levels
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'cashier'::app_role)
);

CREATE POLICY "Managers can manage stock" ON public.stock_levels
FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Drop and recreate policies for stock_adjustments table
DROP POLICY IF EXISTS "Auth users can view adjustments" ON public.stock_adjustments;
DROP POLICY IF EXISTS "Staff can manage adjustments" ON public.stock_adjustments;

CREATE POLICY "Staff can view adjustments" ON public.stock_adjustments
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Managers can manage adjustments" ON public.stock_adjustments
FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Auth users can view adjustment items" ON public.stock_adjustment_items;
DROP POLICY IF EXISTS "Staff can manage adjustment items" ON public.stock_adjustment_items;

CREATE POLICY "Staff can view adjustment items" ON public.stock_adjustment_items
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Managers can manage adjustment items" ON public.stock_adjustment_items
FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Drop and recreate policies for stock_transfers table
DROP POLICY IF EXISTS "Auth users can view transfers" ON public.stock_transfers;
DROP POLICY IF EXISTS "Staff can manage transfers" ON public.stock_transfers;

CREATE POLICY "Staff can view transfers" ON public.stock_transfers
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Managers can manage transfers" ON public.stock_transfers
FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Auth users can view transfer items" ON public.stock_transfer_items;
DROP POLICY IF EXISTS "Staff can manage transfer items" ON public.stock_transfer_items;

CREATE POLICY "Staff can view transfer items" ON public.stock_transfer_items
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Managers can manage transfer items" ON public.stock_transfer_items
FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);