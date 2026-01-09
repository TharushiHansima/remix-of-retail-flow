import { api } from "@/lib/api";
import type { CreateSupplierDto, Supplier, SupplierListQuery, UpdateSupplierDto, UUID } from "./suppliers.types";

function buildQuery(params: Record<string, any>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const str = qs.toString();
  return str ? `?${str}` : "";
}

/**
 * GET /procurement/suppliers
 */
export function listSuppliers(query: SupplierListQuery = {}) {
  const qs = buildQuery({
    q: query.q,
    includeDisabled: query.includeDisabled,
  });
  return api<Supplier[]>(`/procurement/suppliers${qs}`, { method: "GET", auth: true });
}

/**
 * GET /procurement/suppliers/:id
 */
export function getSupplier(id: UUID) {
  return api<Supplier>(`/procurement/suppliers/${id}`, { method: "GET", auth: true });
}

/**
 * POST /procurement/suppliers
 */
export function createSupplier(dto: CreateSupplierDto) {
  return api<Supplier>(`/procurement/suppliers`, { method: "POST", auth: true, json: dto });
}

/**
 * PATCH /procurement/suppliers/:id
 */
export function updateSupplier(id: UUID, dto: UpdateSupplierDto) {
  return api<Supplier>(`/procurement/suppliers/${id}`, { method: "PATCH", auth: true, json: dto });
}

/**
 * PATCH /procurement/suppliers/:id/disable
 */
export function disableSupplier(id: UUID) {
  return api<Supplier>(`/procurement/suppliers/${id}/disable`, { method: "PATCH", auth: true });
}
