-- Create cash_drawers table for drawer sessions
CREATE TABLE public.cash_drawers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  opened_by UUID NOT NULL,
  closed_by UUID,
  opening_float NUMERIC NOT NULL DEFAULT 0,
  expected_closing NUMERIC,
  actual_closing NUMERIC,
  variance NUMERIC,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'reconciled')),
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cash_transactions table for cash-in/cash-out
CREATE TABLE public.cash_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drawer_id UUID NOT NULL REFERENCES public.cash_drawers(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('cash_in', 'cash_out', 'sale', 'refund')),
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  reference TEXT,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cash_drawers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for cash_drawers
CREATE POLICY "Staff can view drawers"
ON public.cash_drawers
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'cashier'));

CREATE POLICY "Staff can open drawers"
ON public.cash_drawers
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'cashier'));

CREATE POLICY "Staff can update own drawers"
ON public.cash_drawers
FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR opened_by = auth.uid());

-- RLS policies for cash_transactions
CREATE POLICY "Staff can view transactions"
ON public.cash_transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'cashier'));

CREATE POLICY "Staff can create transactions"
ON public.cash_transactions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'cashier'));

CREATE POLICY "Managers can update transactions"
ON public.cash_transactions
FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Create indexes for performance
CREATE INDEX idx_cash_drawers_branch ON public.cash_drawers(branch_id);
CREATE INDEX idx_cash_drawers_status ON public.cash_drawers(status);
CREATE INDEX idx_cash_drawers_opened_at ON public.cash_drawers(opened_at);
CREATE INDEX idx_cash_transactions_drawer ON public.cash_transactions(drawer_id);
CREATE INDEX idx_cash_transactions_type ON public.cash_transactions(transaction_type);