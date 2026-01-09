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
