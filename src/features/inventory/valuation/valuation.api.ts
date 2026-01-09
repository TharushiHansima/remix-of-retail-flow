import { supabase } from "@/integrations/supabase/client";
import type {
  CostLayer,
  StockValuation,
  ValuationQueryParams,
  ValuationSummary,
  AllocationMethod,
  AgingBucket,
} from "./valuation.types";

// Helper to map snake_case to camelCase
function mapCostLayer(row: any): CostLayer {
  return {
    id: row.id,
    productId: row.product_id,
    branchId: row.branch_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    sourceNumber: row.source_number,
    receivedQty: Number(row.received_qty),
    remainingQty: Number(row.remaining_qty),
    unitCost: Number(row.unit_cost),
    receivedDate: row.received_date,
    createdAt: row.created_at,
    isExhausted: row.is_exhausted,
  };
}

// List cost layers for a product
export async function listCostLayers(
  productId: string,
  branchId?: string
): Promise<CostLayer[]> {
  let query = supabase
    .from("cost_layers")
    .select("*")
    .eq("product_id", productId)
    .order("received_date", { ascending: true });

  if (branchId) {
    query = query.eq("branch_id", branchId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []).map(mapCostLayer);
}

// List active (non-exhausted) cost layers
export async function listActiveCostLayers(
  productId: string,
  branchId: string
): Promise<CostLayer[]> {
  const { data, error } = await supabase
    .from("cost_layers")
    .select("*")
    .eq("product_id", productId)
    .eq("branch_id", branchId)
    .eq("is_exhausted", false)
    .gt("remaining_qty", 0)
    .order("received_date", { ascending: true });

  if (error) throw error;
  return (data || []).map(mapCostLayer);
}

// Get stock valuation with real-time calculation
export async function getStockValuation(
  params: ValuationQueryParams = {}
): Promise<StockValuation[]> {
  // Build query for products with stock levels
  let query = supabase
    .from("products")
    .select(`
      id,
      name,
      sku,
      costing_method,
      avg_cost,
      cost_price,
      category_id,
      categories:category_id (id, name),
      stock_levels (
        id,
        branch_id,
        quantity,
        reserved_quantity,
        avg_unit_cost,
        total_value,
        branches:branch_id (id, name)
      )
    `)
    .eq("is_active", true);

  if (params.categoryId) {
    query = query.eq("category_id", params.categoryId);
  }

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,sku.ilike.%${params.search}%`);
  }

  const { data: products, error } = await query;

  if (error) throw error;

  const valuations: StockValuation[] = [];

  for (const product of products || []) {
    const stockLevels = (product as any).stock_levels || [];

    for (const sl of stockLevels) {
      // Filter by branch if specified
      if (params.branchId && sl.branch_id !== params.branchId) continue;

      const onHand = Number(sl.quantity) || 0;
      const reserved = Number(sl.reserved_quantity) || 0;
      const available = onHand - reserved;

      // Get unit cost based on costing method
      let unitCost = 0;
      if ((product as any).costing_method === "weighted_average") {
        unitCost = Number(sl.avg_unit_cost) || Number((product as any).avg_cost) || Number((product as any).cost_price) || 0;
      } else {
        // For FIFO, we'd need to look at active layers
        unitCost = Number(sl.avg_unit_cost) || Number((product as any).cost_price) || 0;
      }

      const totalValue = onHand * unitCost;

      // Calculate aging (simplified - would need cost_layers for accurate FIFO aging)
      const daysSinceReceipt = 0; // Would need to query oldest layer
      const agingBucket = getAgingBucket(daysSinceReceipt);

      valuations.push({
        productId: (product as any).id,
        productName: (product as any).name,
        productSku: (product as any).sku,
        branchId: sl.branch_id,
        branchName: sl.branches?.name,
        categoryId: (product as any).category_id,
        categoryName: (product as any).categories?.name,
        onHandQty: onHand,
        reservedQty: reserved,
        availableQty: available,
        costingMethod: (product as any).costing_method || "weighted_average",
        unitCost,
        totalValue,
        daysSinceReceipt,
        agingBucket,
      });
    }
  }

  // Filter by aging bucket if specified
  if (params.agingBucket) {
    return valuations.filter((v) => v.agingBucket === params.agingBucket);
  }

  return valuations;
}

// Get valuation summary statistics
export async function getValuationSummary(
  branchId?: string
): Promise<ValuationSummary> {
  const valuations = await getStockValuation({ branchId });

  const summary: ValuationSummary = {
    totalProducts: valuations.length,
    totalStockValue: 0,
    totalStockQty: 0,
    avgCostPerUnit: 0,
    aging0_30Value: 0,
    aging31_60Value: 0,
    aging61_90Value: 0,
    aging90PlusValue: 0,
    fifoProductsCount: 0,
    weightedAvgProductsCount: 0,
  };

  for (const v of valuations) {
    summary.totalStockValue += v.totalValue;
    summary.totalStockQty += v.onHandQty;

    // By aging bucket
    if (v.agingBucket === "0-30") summary.aging0_30Value += v.totalValue;
    else if (v.agingBucket === "31-60") summary.aging31_60Value += v.totalValue;
    else if (v.agingBucket === "61-90") summary.aging61_90Value += v.totalValue;
    else summary.aging90PlusValue += v.totalValue;

    // By costing method
    if (v.costingMethod === "fifo") summary.fifoProductsCount++;
    else summary.weightedAvgProductsCount++;
  }

  if (summary.totalStockQty > 0) {
    summary.avgCostPerUnit = summary.totalStockValue / summary.totalStockQty;
  }

  return summary;
}

// Allocate landed costs to GRN
export async function allocateLandedCosts(
  grnId: string,
  allocationMethod: AllocationMethod
): Promise<void> {
  // First update allocation method on GRN
  const { error: updateError } = await supabase
    .from("grn")
    .update({ allocation_method: allocationMethod })
    .eq("id", grnId);

  if (updateError) throw updateError;

  // Call the database function to allocate
  const { error } = await supabase.rpc("allocate_grn_landed_costs", {
    p_grn_id: grnId,
  });

  if (error) throw error;
}

// Create FIFO layers from GRN
export async function createFifoLayersFromGrn(grnId: string): Promise<void> {
  const { error } = await supabase.rpc("create_fifo_layers_from_grn", {
    p_grn_id: grnId,
  });

  if (error) throw error;
}

// Update product costing method
export async function updateProductCostingMethod(
  productId: string,
  costingMethod: "fifo" | "weighted_average"
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ costing_method: costingMethod })
    .eq("id", productId);

  if (error) throw error;
}

// Update product weight
export async function updateProductWeight(
  productId: string,
  unitWeight: number
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ unit_weight: unitWeight })
    .eq("id", productId);

  if (error) throw error;
}

// Helper function to determine aging bucket
function getAgingBucket(days: number): AgingBucket {
  if (days <= 30) return "0-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  return "90+";
}

// Get aging analysis with cost layers
export async function getAgingAnalysis(
  branchId?: string
): Promise<{ bucket: AgingBucket; value: number; qty: number }[]> {
  let query = supabase
    .from("cost_layers")
    .select("*")
    .eq("is_exhausted", false)
    .gt("remaining_qty", 0);

  if (branchId) {
    query = query.eq("branch_id", branchId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const now = new Date();
  const buckets: Record<AgingBucket, { value: number; qty: number }> = {
    "0-30": { value: 0, qty: 0 },
    "31-60": { value: 0, qty: 0 },
    "61-90": { value: 0, qty: 0 },
    "90+": { value: 0, qty: 0 },
  };

  for (const layer of data || []) {
    const receivedDate = new Date(layer.received_date);
    const days = Math.floor(
      (now.getTime() - receivedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const bucket = getAgingBucket(days);
    const qty = Number(layer.remaining_qty);
    const value = qty * Number(layer.unit_cost);

    buckets[bucket].value += value;
    buckets[bucket].qty += qty;
  }

  return [
    { bucket: "0-30", ...buckets["0-30"] },
    { bucket: "31-60", ...buckets["31-60"] },
    { bucket: "61-90", ...buckets["61-90"] },
    { bucket: "90+", ...buckets["90+"] },
  ];
}
