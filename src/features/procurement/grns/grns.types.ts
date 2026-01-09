export type UUID = string;

export type CreateGrnDto = {
  poId: UUID;
  purchaseOrderId?: UUID;
  branchId?: UUID;
  grnNumber?: string;
  invoiceNumber?: string;
  supplierInvoiceNo?: string;
  invoiceDate?: string;
  supplierInvoiceDate?: string;
  notes?: string;
  items?: Array<{
    productId: UUID;
    quantity: number;
    unitCost?: number;
  }>;
};

export type GrnsQueryDto = {
  search?: string;
  status?: "pending" | "verified" | "completed";
  branchId?: UUID;
  supplierId?: UUID;
  poId?: UUID;
  from?: string; // ISO date
  to?: string;   // ISO date
  take?: string;
  skip?: string;
};

/**
 * ⚠️ Your backend DTO fields may differ.
 * This is flexible so frontend won’t break typings while you align backend.
 */
export type UpdateGrnVerificationDto = {
  // common patterns (keep flexible)
  status?: "pending" | "verified" | "completed";
  isVerified?: boolean;
  verified?: boolean;
  notes?: string;
};

export type AddLandedCostDto = {
  type: string;
  description?: string;
  amount: number;
};

// ---- Backend response shapes (flexible / Prisma include friendly) ----

export type GrnItemApi = {
  id: UUID;
  productId?: UUID;
  orderedQty?: number | null;
  receivedQty?: number | null;

  quantityOrdered?: number | null;
  quantityReceived?: number | null;

  quantity?: number | null; // some backends use `quantity`
  unitCost?: number | null;

  batchNumber?: string | null;
  expiryDate?: string | null;

  product?: {
    id: UUID;
    name?: string | null;
    sku?: string | null;
    code?: string | null;
  } | null;
};

export type LandedCostApi = {
  id: UUID;
  type: string;
  description?: string | null;
  amount: number;
};

export type GrnApi = {
  id: UUID;

  grnNumber?: string | null;
  status: "pending" | "verified" | "completed";

  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  receivedDate?: string | null;

  subtotal?: number | null;
  landedCost?: number | null;
  totalAmount?: number | null;

  notes?: string | null;

  purchaseOrderId?: UUID | null;
  poId?: UUID | null;

  purchaseOrder?: {
    id: UUID;
    poNumber?: string | null;
    number?: string | null;
  } | null;

  supplier?: { id: UUID; name?: string | null } | null;
  branch?: { id: UUID; name?: string | null } | null;

  items?: GrnItemApi[];
  landedCosts?: LandedCostApi[];
};

export type GrnListResponse = GrnApi[] | { data: GrnApi[]; total?: number };
export type GrnDetailsResponse = GrnApi;
