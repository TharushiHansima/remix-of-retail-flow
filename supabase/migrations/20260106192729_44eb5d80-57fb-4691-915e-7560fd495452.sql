-- Create storage bucket for petty cash receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('petty-cash-receipts', 'petty-cash-receipts', false);

-- Storage policies for petty cash receipts
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'petty-cash-receipts' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'petty-cash-receipts' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own receipts"
ON storage.objects FOR UPDATE
USING (bucket_id = 'petty-cash-receipts' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins and managers can delete receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'petty-cash-receipts' AND (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
));

-- Add receipt_url column to petty_cash_expenses
ALTER TABLE public.petty_cash_expenses 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Create petty cash fund tracking table
CREATE TABLE public.petty_cash_funds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('replenishment', 'expense', 'adjustment')),
  amount NUMERIC(12,2) NOT NULL,
  balance_after NUMERIC(12,2) NOT NULL,
  reference_id UUID,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on petty_cash_funds
ALTER TABLE public.petty_cash_funds ENABLE ROW LEVEL SECURITY;

-- RLS policies for petty_cash_funds
CREATE POLICY "Authenticated users can view fund transactions"
ON public.petty_cash_funds FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create fund transactions"
ON public.petty_cash_funds FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for better query performance
CREATE INDEX idx_petty_cash_funds_branch_created ON public.petty_cash_funds(branch_id, created_at DESC);