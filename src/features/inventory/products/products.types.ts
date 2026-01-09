// src/features/inventory/products/products.types.ts

export type UUID = string;

/**
 * Branch stock row returned from backend include:
 * productBranch -> { stockQty, reservedQty, minStock, maxStock, ... , branch: { id, name, code } }
 */
export type ProductBranch = {
  id?: UUID;
  productId?: UUID;
  branchId: UUID;

  stockQty?: number | null;
  reservedQty?: number | null;

  minStock?: number | null;
  maxStock?: number | null;

  reorderQty?: number | null;

  // included relation (if backend includes it)
  branch?: { id: UUID; name: string; code?: string | null } | null;
};

export type Product = {
  id: UUID;

  name: string;
  sku?: string | null;
  barcode?: string | null;

  brandId?: UUID | null;
  categoryId?: UUID | null;
  brand?: { id: UUID; name: string } | null;
  category?: { id: UUID; name: string } | null;

  // sometimes backend sends convenience fields
  brandName?: string | null;
  categoryName?: string | null;

  isActive: boolean;

  // stock behavior flags
  isSerialized: boolean;
  isBatched: boolean;

  // pricing/cost fields (optional because backend may differ)
  unitPrice?: number | string | null;
  costPrice?: number | string | null;
  sellingPrice?: number | string | null;

  // ✅ ADDED: wholesale price (backend has it but UI wasn’t mapping it)
  wholesalePrice?: number | string | null;

  // ✅ ADDED: stock by branch rows (backend includes this as "branches")
  branches?: ProductBranch[];

  // common audit fields
  createdAt?: string;
  updatedAt?: string;
};

export type ProductListQuery = {
  q?: string;
  brandId?: UUID;
  categoryId?: UUID;
  isActive?: boolean;
  isSerialized?: boolean;
  isBatched?: boolean;
  page?: number;
  pageSize?: number;
};

/**
 * NOTE:
 * Your backend returns: { data, meta }
 * But UI earlier expected: { items, total, page, pageSize }
 * We keep both shapes supported.
 */
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type BackendPaginated<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages?: number;
  };
};

// If backend returns plain array, we support that too.
export type ProductListResponse =
  | Paginated<Product>
  | BackendPaginated<Product>
  | Product[];

export type CreateProductDto = {
  name: string;
  sku?: string;
  barcode?: string;

  brandId?: UUID | null;
  categoryId?: UUID | null;

  isSerialized?: boolean;
  isBatched?: boolean;

  unitPrice?: number;
  costPrice?: number;
  sellingPrice?: number;

  // ✅ ADDED: wholesale + stock setup fields (match your backend CreateProductDto)
  wholesalePrice?: number;

  // ✅ ADDED: unit weight for weight-based landed cost allocation
  unitWeight?: number;

  // stock settings for product branch initialization (your backend supports these)
  branchId?: UUID; // optional default branch to create ProductBranch
  minStockLevel?: number;
  maxStockLevel?: number | null;
  reorderQty?: number;

  isActive?: boolean;
};

export type UpdateProductDto = Partial<CreateProductDto>;

export type ProductSupplierInput = {
  supplierId: UUID;
  supplierSku?: string | null;
  costPrice?: number | null;
  isDefault?: boolean;
};

export type ReplaceProductSuppliersDto = {
  suppliers: ProductSupplierInput[];
};

export type ProductSupplier = {
  id: UUID;
  productId: UUID;
  supplierId: UUID;
  supplierSku?: string | null;
  costPrice?: number | string | null;
  isDefault?: boolean;
};

export type SerialItem = {
  id: UUID;
  serialNumber: string;
  branchId: UUID;
  status?: string;
};

export type BatchItem = {
  id: UUID;
  batchNo: string;
  branchId: UUID;
  quantity: number;
  costPrice?: number | string | null;
  expiryDate?: string | null;
};
