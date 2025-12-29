-- Create approvals table to track pending approvals across entities
CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'purchase_order', 'stock_adjustment', 'invoice', 'discount'
  entity_id UUID NOT NULL,
  rule_id TEXT NOT NULL, -- matches ApprovalRule.id from config
  rule_name TEXT NOT NULL,
  requested_by UUID REFERENCES auth.users(id),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  comment TEXT,
  metadata JSONB DEFAULT '{}', -- store context like amount, discount %, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Auth users can view approvals"
ON public.approvals FOR SELECT
USING (true);

CREATE POLICY "Auth users can create approvals"
ON public.approvals FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can update approvals"
ON public.approvals FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.approvals;

-- Index for performance
CREATE INDEX idx_approvals_status ON public.approvals(status);
CREATE INDEX idx_approvals_entity ON public.approvals(entity_type, entity_id);