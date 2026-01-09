-- ===========================================
-- INVENTORY VALUATION SYSTEM
-- FIFO Cost Layers + Weighted Average + Landed Cost Allocation
-- ===========================================

-- 1) Add costing method and weight to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS costing_method text NOT NULL DEFAULT 'weighted_average',
ADD COLUMN IF NOT EXISTS unit_weight numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_cost numeric NOT NULL DEFAULT 0;

-- Add constraint for costing method
ALTER TABLE public.products 
ADD CONSTRAINT products_costing_method_check 
CHECK (costing_method IN ('fifo', 'weighted_average'));

-- 2) Create FIFO cost layers table
CREATE TABLE public.cost_layers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  
  -- Source document reference
  source_type text NOT NULL, -- 'grn', 'adjustment', 'transfer', 'opening'
  source_id uuid,
  source_number text,
  
  -- Quantities
  received_qty numeric NOT NULL DEFAULT 0,
  remaining_qty numeric NOT NULL DEFAULT 0,
  
  -- Cost per unit (including any allocated landed costs)
  unit_cost numeric NOT NULL DEFAULT 0,
  
  -- Dates
  received_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- For tracking consumption
  is_exhausted boolean NOT NULL DEFAULT false
);

-- Indexes for FIFO queries
CREATE INDEX idx_cost_layers_product_branch ON public.cost_layers(product_id, branch_id);
CREATE INDEX idx_cost_layers_fifo ON public.cost_layers(product_id, branch_id, received_date) 
  WHERE is_exhausted = false;
CREATE INDEX idx_cost_layers_source ON public.cost_layers(source_type, source_id);

-- 3) Create cost layer consumption tracking (for audit trail)
CREATE TABLE public.cost_layer_consumptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cost_layer_id uuid NOT NULL REFERENCES public.cost_layers(id) ON DELETE CASCADE,
  
  -- What consumed this layer
  consumption_type text NOT NULL, -- 'sale', 'repair', 'adjustment', 'transfer'
  consumption_id uuid,
  consumption_number text,
  
  -- Quantity consumed from this layer
  quantity_consumed numeric NOT NULL,
  unit_cost_at_consumption numeric NOT NULL,
  total_cost numeric NOT NULL,
  
  consumed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_layer_consumptions_layer ON public.cost_layer_consumptions(cost_layer_id);
CREATE INDEX idx_layer_consumptions_consumption ON public.cost_layer_consumptions(consumption_type, consumption_id);

-- 4) Update stock_levels to track weighted average cost per branch
ALTER TABLE public.stock_levels 
ADD COLUMN IF NOT EXISTS avg_unit_cost numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_value numeric NOT NULL DEFAULT 0;

-- 5) Add landed cost allocation fields to grn
ALTER TABLE public.grn 
ADD COLUMN IF NOT EXISTS allocation_method text DEFAULT 'quantity',
ADD COLUMN IF NOT EXISTS is_landed_cost_allocated boolean NOT NULL DEFAULT false;

ALTER TABLE public.grn 
ADD CONSTRAINT grn_allocation_method_check 
CHECK (allocation_method IN ('quantity', 'value', 'weight'));

-- 6) Add allocated landed cost to grn_items
ALTER TABLE public.grn_items 
ADD COLUMN IF NOT EXISTS allocated_landed_cost numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_unit_cost numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_line_cost numeric NOT NULL DEFAULT 0;

-- 7) Create inventory valuation snapshot table (for periodic reports)
CREATE TABLE public.inventory_valuation_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  snapshot_date date NOT NULL,
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_sku text,
  
  -- Quantities
  on_hand_qty numeric NOT NULL DEFAULT 0,
  reserved_qty numeric NOT NULL DEFAULT 0,
  available_qty numeric NOT NULL DEFAULT 0,
  
  -- Costing
  costing_method text NOT NULL,
  unit_cost numeric NOT NULL DEFAULT 0,
  total_value numeric NOT NULL DEFAULT 0,
  
  -- Aging (days since oldest layer or last movement)
  days_since_receipt integer DEFAULT 0,
  aging_bucket text, -- '0-30', '31-60', '61-90', '90+'
  
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_valuation_snapshots_date ON public.inventory_valuation_snapshots(snapshot_date);
CREATE INDEX idx_valuation_snapshots_product ON public.inventory_valuation_snapshots(product_id);
CREATE INDEX idx_valuation_snapshots_branch ON public.inventory_valuation_snapshots(branch_id);
CREATE INDEX idx_valuation_snapshots_category ON public.inventory_valuation_snapshots(category_id);
CREATE INDEX idx_valuation_snapshots_aging ON public.inventory_valuation_snapshots(aging_bucket);

-- 8) RLS Policies for cost_layers
ALTER TABLE public.cost_layers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can manage cost layers"
ON public.cost_layers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Staff can view cost layers"
ON public.cost_layers FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'cashier'::app_role));

-- 9) RLS Policies for cost_layer_consumptions
ALTER TABLE public.cost_layer_consumptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can manage consumptions"
ON public.cost_layer_consumptions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Staff can view consumptions"
ON public.cost_layer_consumptions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'cashier'::app_role));

-- 10) RLS Policies for inventory_valuation_snapshots
ALTER TABLE public.inventory_valuation_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can manage valuation snapshots"
ON public.inventory_valuation_snapshots FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Staff can view valuation snapshots"
ON public.inventory_valuation_snapshots FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'cashier'::app_role));

-- 11) Function to calculate aging bucket
CREATE OR REPLACE FUNCTION public.get_aging_bucket(days_old integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN days_old <= 30 THEN '0-30'
    WHEN days_old <= 60 THEN '31-60'
    WHEN days_old <= 90 THEN '61-90'
    ELSE '90+'
  END;
$$;

-- 12) Function to update weighted average cost on receipt
CREATE OR REPLACE FUNCTION public.update_weighted_average_cost()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product products%ROWTYPE;
  v_stock_level stock_levels%ROWTYPE;
  v_grn grn%ROWTYPE;
  v_old_qty numeric;
  v_old_value numeric;
  v_new_qty numeric;
  v_new_value numeric;
  v_new_avg numeric;
BEGIN
  -- Only process on completed GRN
  SELECT * INTO v_grn FROM grn WHERE id = NEW.grn_id;
  
  -- Get product
  SELECT * INTO v_product FROM products WHERE id = NEW.product_id;
  
  -- Only update if product uses weighted average
  IF v_product.costing_method = 'weighted_average' THEN
    -- Get current stock level
    SELECT * INTO v_stock_level 
    FROM stock_levels 
    WHERE product_id = NEW.product_id AND branch_id = v_grn.branch_id;
    
    IF v_stock_level IS NOT NULL THEN
      v_old_qty := COALESCE(v_stock_level.quantity, 0);
      v_old_value := v_old_qty * COALESCE(v_stock_level.avg_unit_cost, 0);
      
      v_new_qty := COALESCE(NEW.received_quantity, 0);
      v_new_value := v_new_qty * COALESCE(NEW.final_unit_cost, NEW.unit_cost, 0);
      
      IF (v_old_qty + v_new_qty) > 0 THEN
        v_new_avg := (v_old_value + v_new_value) / (v_old_qty + v_new_qty);
      ELSE
        v_new_avg := COALESCE(NEW.final_unit_cost, NEW.unit_cost, 0);
      END IF;
      
      -- Update stock level with new average
      UPDATE stock_levels 
      SET avg_unit_cost = v_new_avg,
          total_value = (quantity + NEW.received_quantity) * v_new_avg
      WHERE product_id = NEW.product_id AND branch_id = v_grn.branch_id;
      
      -- Also update product avg_cost (global average)
      UPDATE products SET avg_cost = v_new_avg WHERE id = NEW.product_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 13) Function to allocate landed costs to GRN items
CREATE OR REPLACE FUNCTION public.allocate_grn_landed_costs(p_grn_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_grn grn%ROWTYPE;
  v_total_landed_cost numeric;
  v_total_qty numeric;
  v_total_value numeric;
  v_total_weight numeric;
  v_item RECORD;
BEGIN
  -- Get GRN
  SELECT * INTO v_grn FROM grn WHERE id = p_grn_id;
  
  IF v_grn IS NULL THEN
    RAISE EXCEPTION 'GRN not found: %', p_grn_id;
  END IF;
  
  -- Get total landed costs
  SELECT COALESCE(SUM(amount), 0) INTO v_total_landed_cost
  FROM grn_landed_costs WHERE grn_id = p_grn_id;
  
  -- Calculate totals based on allocation method
  IF v_grn.allocation_method = 'quantity' THEN
    SELECT COALESCE(SUM(received_quantity), 0) INTO v_total_qty
    FROM grn_items WHERE grn_id = p_grn_id;
    
    -- Allocate by quantity
    FOR v_item IN SELECT gi.*, p.unit_weight 
                  FROM grn_items gi 
                  JOIN products p ON p.id = gi.product_id 
                  WHERE gi.grn_id = p_grn_id
    LOOP
      UPDATE grn_items SET 
        allocated_landed_cost = CASE 
          WHEN v_total_qty > 0 THEN (v_item.received_quantity::numeric / v_total_qty) * v_total_landed_cost
          ELSE 0 
        END,
        final_unit_cost = unit_cost + CASE 
          WHEN v_total_qty > 0 AND v_item.received_quantity > 0 
          THEN ((v_item.received_quantity::numeric / v_total_qty) * v_total_landed_cost) / v_item.received_quantity
          ELSE 0 
        END,
        total_line_cost = (unit_cost * received_quantity) + CASE 
          WHEN v_total_qty > 0 THEN (v_item.received_quantity::numeric / v_total_qty) * v_total_landed_cost
          ELSE 0 
        END
      WHERE id = v_item.id;
    END LOOP;
    
  ELSIF v_grn.allocation_method = 'value' THEN
    SELECT COALESCE(SUM(received_quantity * unit_cost), 0) INTO v_total_value
    FROM grn_items WHERE grn_id = p_grn_id;
    
    -- Allocate by value
    FOR v_item IN SELECT * FROM grn_items WHERE grn_id = p_grn_id
    LOOP
      UPDATE grn_items SET 
        allocated_landed_cost = CASE 
          WHEN v_total_value > 0 THEN ((v_item.received_quantity * v_item.unit_cost) / v_total_value) * v_total_landed_cost
          ELSE 0 
        END,
        final_unit_cost = unit_cost + CASE 
          WHEN v_total_value > 0 AND v_item.received_quantity > 0 
          THEN (((v_item.received_quantity * v_item.unit_cost) / v_total_value) * v_total_landed_cost) / v_item.received_quantity
          ELSE 0 
        END,
        total_line_cost = (unit_cost * received_quantity) + CASE 
          WHEN v_total_value > 0 THEN ((v_item.received_quantity * v_item.unit_cost) / v_total_value) * v_total_landed_cost
          ELSE 0 
        END
      WHERE id = v_item.id;
    END LOOP;
    
  ELSIF v_grn.allocation_method = 'weight' THEN
    SELECT COALESCE(SUM(gi.received_quantity * COALESCE(p.unit_weight, 0)), 0) INTO v_total_weight
    FROM grn_items gi
    JOIN products p ON p.id = gi.product_id
    WHERE gi.grn_id = p_grn_id;
    
    -- Allocate by weight
    FOR v_item IN SELECT gi.*, p.unit_weight 
                  FROM grn_items gi 
                  JOIN products p ON p.id = gi.product_id 
                  WHERE gi.grn_id = p_grn_id
    LOOP
      UPDATE grn_items SET 
        allocated_landed_cost = CASE 
          WHEN v_total_weight > 0 THEN ((v_item.received_quantity * COALESCE(v_item.unit_weight, 0)) / v_total_weight) * v_total_landed_cost
          ELSE 0 
        END,
        final_unit_cost = unit_cost + CASE 
          WHEN v_total_weight > 0 AND v_item.received_quantity > 0 
          THEN (((v_item.received_quantity * COALESCE(v_item.unit_weight, 0)) / v_total_weight) * v_total_landed_cost) / v_item.received_quantity
          ELSE 0 
        END,
        total_line_cost = (unit_cost * received_quantity) + CASE 
          WHEN v_total_weight > 0 THEN ((v_item.received_quantity * COALESCE(v_item.unit_weight, 0)) / v_total_weight) * v_total_landed_cost
          ELSE 0 
        END
      WHERE id = v_item.id;
    END LOOP;
  END IF;
  
  -- Mark GRN as having landed costs allocated
  UPDATE grn SET is_landed_cost_allocated = true WHERE id = p_grn_id;
  
  -- Update GRN totals
  UPDATE grn SET 
    subtotal = (SELECT COALESCE(SUM(received_quantity * unit_cost), 0) FROM grn_items WHERE grn_id = p_grn_id),
    landed_cost = v_total_landed_cost,
    total_amount = (SELECT COALESCE(SUM(total_line_cost), 0) FROM grn_items WHERE grn_id = p_grn_id)
  WHERE id = p_grn_id;
END;
$$;

-- 14) Function to create FIFO cost layers from GRN
CREATE OR REPLACE FUNCTION public.create_fifo_layers_from_grn(p_grn_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_grn grn%ROWTYPE;
  v_item RECORD;
BEGIN
  SELECT * INTO v_grn FROM grn WHERE id = p_grn_id;
  
  IF v_grn IS NULL THEN
    RAISE EXCEPTION 'GRN not found: %', p_grn_id;
  END IF;
  
  -- Create cost layers for each GRN item (for FIFO products)
  FOR v_item IN 
    SELECT gi.*, p.costing_method 
    FROM grn_items gi
    JOIN products p ON p.id = gi.product_id
    WHERE gi.grn_id = p_grn_id AND p.costing_method = 'fifo'
  LOOP
    INSERT INTO cost_layers (
      product_id,
      branch_id,
      source_type,
      source_id,
      source_number,
      received_qty,
      remaining_qty,
      unit_cost,
      received_date
    ) VALUES (
      v_item.product_id,
      v_grn.branch_id,
      'grn',
      p_grn_id,
      v_grn.grn_number,
      v_item.received_quantity,
      v_item.received_quantity,
      COALESCE(v_item.final_unit_cost, v_item.unit_cost),
      COALESCE(v_grn.created_at, now())
    );
  END LOOP;
END;
$$;

-- 15) Function to consume FIFO layers (for sales/repairs)
CREATE OR REPLACE FUNCTION public.consume_fifo_layers(
  p_product_id uuid,
  p_branch_id uuid,
  p_quantity numeric,
  p_consumption_type text,
  p_consumption_id uuid,
  p_consumption_number text
)
RETURNS numeric -- Returns total COGS
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining numeric := p_quantity;
  v_total_cogs numeric := 0;
  v_layer RECORD;
  v_consume_qty numeric;
BEGIN
  -- Process layers in FIFO order
  FOR v_layer IN 
    SELECT * FROM cost_layers 
    WHERE product_id = p_product_id 
      AND branch_id = p_branch_id 
      AND is_exhausted = false 
      AND remaining_qty > 0
    ORDER BY received_date ASC, created_at ASC
  LOOP
    EXIT WHEN v_remaining <= 0;
    
    -- Determine how much to consume from this layer
    v_consume_qty := LEAST(v_remaining, v_layer.remaining_qty);
    
    -- Record consumption
    INSERT INTO cost_layer_consumptions (
      cost_layer_id,
      consumption_type,
      consumption_id,
      consumption_number,
      quantity_consumed,
      unit_cost_at_consumption,
      total_cost
    ) VALUES (
      v_layer.id,
      p_consumption_type,
      p_consumption_id,
      p_consumption_number,
      v_consume_qty,
      v_layer.unit_cost,
      v_consume_qty * v_layer.unit_cost
    );
    
    -- Update layer
    UPDATE cost_layers SET 
      remaining_qty = remaining_qty - v_consume_qty,
      is_exhausted = (remaining_qty - v_consume_qty) <= 0
    WHERE id = v_layer.id;
    
    -- Accumulate COGS
    v_total_cogs := v_total_cogs + (v_consume_qty * v_layer.unit_cost);
    v_remaining := v_remaining - v_consume_qty;
  END LOOP;
  
  RETURN v_total_cogs;
END;
$$;

-- 16) Function to calculate COGS based on costing method
CREATE OR REPLACE FUNCTION public.calculate_cogs(
  p_product_id uuid,
  p_branch_id uuid,
  p_quantity numeric,
  p_consumption_type text DEFAULT 'sale',
  p_consumption_id uuid DEFAULT NULL,
  p_consumption_number text DEFAULT NULL
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product products%ROWTYPE;
  v_stock_level stock_levels%ROWTYPE;
  v_cogs numeric := 0;
BEGIN
  SELECT * INTO v_product FROM products WHERE id = p_product_id;
  
  IF v_product IS NULL THEN
    RETURN 0;
  END IF;
  
  IF v_product.costing_method = 'fifo' THEN
    -- Use FIFO layers
    v_cogs := consume_fifo_layers(
      p_product_id,
      p_branch_id,
      p_quantity,
      p_consumption_type,
      p_consumption_id,
      p_consumption_number
    );
  ELSE
    -- Use weighted average
    SELECT * INTO v_stock_level 
    FROM stock_levels 
    WHERE product_id = p_product_id AND branch_id = p_branch_id;
    
    v_cogs := p_quantity * COALESCE(v_stock_level.avg_unit_cost, v_product.avg_cost, v_product.cost_price, 0);
  END IF;
  
  RETURN v_cogs;
END;
$$;