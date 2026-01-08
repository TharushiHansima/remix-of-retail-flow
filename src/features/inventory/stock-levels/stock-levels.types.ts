export type UUID = string;

export type StockLevelRow = {
  productId: UUID;
  branchId: UUID;

  stockQty: number;
  reservedQty?: number;     // only if withReserved=true
  availableQty: number;

  minStock?: number | null;
  maxStock?: number | null;

  location?: string | null;
  updatedAt?: string;

  product: {
    id: UUID;
    sku?: string | null;
    name: string;
    isActive: boolean;

    categoryId?: UUID | null;
    brandId?: UUID | null;

    category?: { id: UUID; name: string } | null;
    brand?: { id: UUID; name: string } | null;
  };

  branch: {
    id: UUID;
    name: string;
    code?: string | null;
  };
};

export type StockLevelsQuery = {
  branchId?: UUID;
  categoryId?: UUID;
  q?: string;
  belowMin?: boolean;
  withReserved?: boolean;
};
