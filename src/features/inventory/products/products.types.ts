export type UUID = string;

export type Product = {
  id: UUID;

  name: string;
  sku?: string | null;
  barcode?: string | null;

  brandId?: UUID | null;
  categoryId?: UUID | null;
  brand?: { id: UUID; name: string } | null;
  category?: { id: UUID; name: string } | null;
  brandName?: string | null;
  categoryName?: string | null;

  isActive: boolean;

  // stock behavior flags (based on your controller filters)
  isSerialized: boolean;
  isBatched: boolean;

  // pricing/cost fields (keep optional because DTO may differ)
  unitPrice?: number | string | null;
  costPrice?: number | string | null;
  sellingPrice?: number | string | null;

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

// Your backend service likely returns pagination
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

// If backend returns plain array, we’ll support both in UI code later.
export type ProductListResponse = Paginated<Product> | Product[];

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

  // add more fields exactly as your CreateProductDto later
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
