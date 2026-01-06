import { api } from "@/lib/api";
import type {
  BatchItem,
  CreateProductDto,
  Product,
  ProductListQuery,
  ProductListResponse,
  ProductSupplier,
  ProductSupplierInput,
  ReplaceProductSuppliersDto,
  SerialItem,
  UpdateProductDto,
  UUID,
} from "./products.types";

function buildQuery(params: Record<string, any>) {
  const qs = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    qs.set(key, String(value));
  });

  const str = qs.toString();
  return str ? `?${str}` : "";
}

/**
 * GET /inventory/products
 */
export function listProducts(query: ProductListQuery = {}) {
  const qs = buildQuery({
    q: query.q,
    brandId: query.brandId,
    categoryId: query.categoryId,
    isActive: query.isActive,
    isSerialized: query.isSerialized,
    isBatched: query.isBatched,
    page: query.page,
    pageSize: query.pageSize,
  });

  return api<ProductListResponse>(`/inventory/products${qs}`, { method: "GET", auth: true });
}

/**
 * GET /inventory/products/:id
 */
export function getProduct(id: UUID) {
  return api<Product>(`/inventory/products/${id}`, { method: "GET", auth: true });
}

/**
 * POST /inventory/products
 */
export function createProduct(dto: CreateProductDto) {
  return api<Product>("/inventory/products", { method: "POST", auth: true, json: dto });
}

/**
 * PATCH /inventory/products/:id
 */
export function updateProduct(id: UUID, dto: UpdateProductDto) {
  return api<Product>(`/inventory/products/${id}`, { method: "PATCH", auth: true, json: dto });
}

/**
 * PATCH /inventory/products/:id/disable
 */
export function disableProduct(id: UUID) {
  return api<Product>(`/inventory/products/${id}/disable`, { method: "PATCH", auth: true });
}

/**
 * PUT /inventory/products/:id/suppliers
 * Replace all supplier mappings for a product
 */
export function replaceProductSuppliers(id: UUID, dto: ReplaceProductSuppliersDto) {
  return api<ProductSupplier[]>(`/inventory/products/${id}/suppliers`, {
    method: "PUT",
    auth: true,
    json: dto,
  });
}

/**
 * POST /inventory/products/:id/suppliers
 * Add one supplier mapping
 */
export function addProductSupplier(id: UUID, dto: ProductSupplierInput) {
  return api<ProductSupplier>(`/inventory/products/${id}/suppliers`, {
    method: "POST",
    auth: true,
    json: dto,
  });
}

/**
 * DELETE /inventory/products/:id/suppliers/:productSupplierId
 */
export function removeProductSupplier(id: UUID, productSupplierId: UUID) {
  return api<{ success: boolean } | ProductSupplier>(`/inventory/products/${id}/suppliers/${productSupplierId}`, {
    method: "DELETE",
    auth: true,
  });
}

/**
 * GET /inventory/products/:id/serials?branchId=
 */
export function listProductSerials(id: UUID, branchId?: UUID) {
  const qs = buildQuery({ branchId });
  return api<SerialItem[]>(`/inventory/products/${id}/serials${qs}`, { method: "GET", auth: true });
}

/**
 * GET /inventory/products/:id/batches?branchId=
 */
export function listProductBatches(id: UUID, branchId?: UUID) {
  const qs = buildQuery({ branchId });
  return api<BatchItem[]>(`/inventory/products/${id}/batches${qs}`, { method: "GET", auth: true });
}
