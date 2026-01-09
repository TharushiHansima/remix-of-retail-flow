// Inventory Valuation Types

export type CostingMethod = "FIFO" | "MOVING_AVG";
export type AgingBucket = "0-30" | "31-60" | "61-90" | "90+" | "ALL";
export type MovementType = "IN" | "OUT";
export type DocumentType = "GRN" | "Invoice" | "JobCard" | "Adjustment" | "Transfer";

export interface ValuationFilters {
  branchId?: string;
  locationId?: string;
  categoryId?: string;
  supplierId?: string;
  agingBucket?: AgingBucket;
  costingMethod?: CostingMethod;
  asOfDate?: string;
  search?: string;
}

export interface ValuationRow {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  categoryId?: string;
  categoryName?: string;
  supplierId?: string;
  supplierName?: string;
  branchId?: string;
  branchName?: string;
  locationId?: string;
  locationName?: string;
  onHandQty: number;
  unitCost: number;
  stockValue: number;
  agingBucket: AgingBucket;
  costingMethod: CostingMethod;
  lastReceiptDate?: string;
  avgCost?: number;
  fifoValue?: number;
  movingAvgValue?: number;
}

export interface FifoLayerRow {
  id: string;
  productId: string;
  grnId?: string;
  grnNumber?: string;
  grnDate: string;
  receivedQty: number;
  remainingQty: number;
  unitCost: number;
  layerValue: number;
  isExhausted: boolean;
}

export interface MovementRow {
  id: string;
  productId: string;
  dateTime: string;
  type: MovementType;
  documentType: DocumentType;
  documentId?: string;
  referenceNo: string;
  qty: number;
  unitCost?: number;
  runningBalance: number;
}

export interface ProductValuationDetails {
  productId: string;
  productName: string;
  sku: string;
  brandName?: string;
  categoryName?: string;
  supplierName?: string;
  costingMethod: CostingMethod;
  onHandQty: number;
  unitCost: number;
  totalValue: number;
  lastReceiptDate?: string;
  fifoLayers: FifoLayerRow[];
  movements: MovementRow[];
}

export interface ValuationSummary {
  totalSkus: number;
  totalOnHandQty: number;
  totalStockValue: number;
  averageUnitCost: number;
  snapshotDate?: string; // For historical point-in-time reporting
  isHistorical?: boolean;
}

export interface Branch {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
  branchId: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
}
