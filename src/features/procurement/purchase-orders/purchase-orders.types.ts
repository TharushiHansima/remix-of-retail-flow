export type UUID = string;

export type PurchaseOrderStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "partially_received"
  | "received"
  | "cancelled";

export type PurchaseOrderItem = {
  id: UUID;
  productId: UUID;
  quantity: number;
  receivedQty?: number;
  unitCost: number | string;
  taxRate?: number | string;
  lineTotal?: number | string;

  product?: {
    id: UUID;
    name: string;
    sku?: string | null;
  };
};

export type PurchaseOrder = {
  id: UUID;
  poNumber: string;

  supplierId: UUID;
  branchId: UUID;

  status: PurchaseOrderStatus;

  expectedDate?: string | null;
  notes?: string | null;

  subtotal?: number | string;
  taxAmount?: number | string;
  totalAmount?: number | string;

  createdAt?: string;
  updatedAt?: string;

  supplier?: { id: UUID; name: string; email?: string | null };
  branch?: { id: UUID; name: string; code?: string | null };
  createdBy?: { id: UUID; name: string; email?: string | null };

  items: PurchaseOrderItem[];
};

export type PurchaseOrdersQuery = {
  q?: string;
  status?: PurchaseOrderStatus;
  supplierId?: UUID;
  branchId?: UUID;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
};

export type Paginated<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

export type CreatePurchaseOrderDto = {
  poNumber?: string;
  supplierId: UUID;
  branchId: UUID;
  expectedDate?: string;
  notes?: string;
  items: Array<{
    productId: UUID;
    quantity: number;
    unitCost: number;
    taxRate?: number;
  }>;
};

export type UpdatePurchaseOrderDto = Partial<CreatePurchaseOrderDto> & {
  status?: PurchaseOrderStatus;
};
