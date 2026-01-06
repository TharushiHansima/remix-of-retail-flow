-- Create petty cash expenses table
CREATE TABLE public.petty_cash_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  receipt_reference TEXT,
  created_by UUID NOT NULL,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.petty_cash_expenses ENABLE ROW LEVEL SECURITY;

-- Staff can view petty cash expenses
CREATE POLICY "Staff can view petty cash expenses"
ON public.petty_cash_expenses
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'cashier'::app_role)
);

-- Staff can create petty cash expenses
CREATE POLICY "Staff can create petty cash expenses"
ON public.petty_cash_expenses
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'cashier'::app_role)
);

-- Managers can update petty cash expenses
CREATE POLICY "Managers can update petty cash expenses"
ON public.petty_cash_expenses
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Admins can delete petty cash expenses
CREATE POLICY "Admins can delete petty cash expenses"
ON public.petty_cash_expenses
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_petty_cash_expenses_updated_at
BEFORE UPDATE ON public.petty_cash_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();