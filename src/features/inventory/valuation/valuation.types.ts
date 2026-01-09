// Inventory Valuation Types

export type UUID = string;

export type CostingMethod = 'fifo' | 'weighted_average';
export type AllocationMethod = 'quantity' | 'value' | 'weight';
export type AgingBucket = '0-30' | '31-60' | '61-90' | '90+';

// Cost Layer for FIFO tracking
export type CostLayer = {
  id: UUID;
  productId: UUID;
  branchId: UUID;
  sourceType: 'grn' | 'adjustment' | 'transfer' | 'opening';
  sourceId?: UUID;
  sourceNumber?: string;
  receivedQty: number;
  remainingQty: number;
  unitCost: number;
  receivedDate: string;
  createdAt: string;
  isExhausted: boolean;
  
  // Relations
  product?: { id: UUID; name: string; sku: string };
  branch?: { id: UUID; name: string };
};

// Cost Layer Consumption (audit trail)
export type CostLayerConsumption = {
  id: UUID;
  costLayerId: UUID;
  consumptionType: 'sale' | 'repair' | 'adjustment' | 'transfer';
  consumptionId?: UUID;
  consumptionNumber?: string;
  quantityConsumed: number;
  unitCostAtConsumption: number;
  totalCost: number;
  consumedAt: string;
  createdAt: string;
};

// Stock valuation per product/branch
export type StockValuation = {
  id?: UUID;
  productId: UUID;
  productName: string;
  productSku?: string;
  branchId?: UUID;
  branchName?: string;
  categoryId?: UUID;
  categoryName?: string;
  supplierId?: UUID;
  supplierName?: string;
  
  // Quantities
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  
  // Costing
  costingMethod: CostingMethod;
  unitCost: number;
  totalValue: number;
  
  // Aging
  daysSinceReceipt: number;
  agingBucket: AgingBucket;
};

// Valuation snapshot for reporting
export type ValuationSnapshot = {
  id: UUID;
  snapshotDate: string;
  branchId?: UUID;
  categoryId?: UUID;
  supplierId?: UUID;
  productId: UUID;
  productName: string;
  productSku?: string;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  costingMethod: CostingMethod;
  unitCost: number;
  totalValue: number;
  daysSinceReceipt: number;
  agingBucket?: AgingBucket;
  createdAt: string;
};

// Query parameters for valuation reports
export type ValuationQueryParams = {
  branchId?: UUID;
  categoryId?: UUID;
  supplierId?: UUID;
  agingBucket?: AgingBucket;
  costingMethod?: CostingMethod;
  search?: string;
};

// Landed cost allocation request
export type AllocateLandedCostsRequest = {
  grnId: UUID;
  allocationMethod: AllocationMethod;
};

// COGS calculation request
export type CalculateCOGSRequest = {
  productId: UUID;
  branchId: UUID;
  quantity: number;
  consumptionType?: 'sale' | 'repair' | 'adjustment' | 'transfer';
  consumptionId?: UUID;
  consumptionNumber?: string;
};

// Summary stats for valuation dashboard
export type ValuationSummary = {
  totalProducts: number;
  totalStockValue: number;
  totalStockQty: number;
  avgCostPerUnit: number;
  
  // By aging bucket
  aging0_30Value: number;
  aging31_60Value: number;
  aging61_90Value: number;
  aging90PlusValue: number;
  
  // By costing method
  fifoProductsCount: number;
  weightedAvgProductsCount: number;
};
