import { api } from "@/lib/api";
import type {
  CreatePurchaseOrderDto,
  Paginated,
  PurchaseOrder,
  PurchaseOrdersQuery,
  UpdatePurchaseOrderDto,
  UUID,
} from "./purchase-orders.types";

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
 * POST /procurement/purchase-orders
 */
export function createPurchaseOrder(dto: CreatePurchaseOrderDto) {
  return api<PurchaseOrder>(`/procurement/purchase-orders`, {
    method: "POST",
    auth: true,
    json: dto,
  });
}

/**
 * GET /procurement/purchase-orders
 * returns { data, meta }
 */
export function listPurchaseOrders(query: PurchaseOrdersQuery = {}) {
  const qs = buildQuery(query);
  return api<Paginated<PurchaseOrder>>(`/procurement/purchase-orders${qs}`, {
    method: "GET",
    auth: true,
  });
}

/**
 * GET /procurement/purchase-orders/:id
 */
export function getPurchaseOrder(id: UUID) {
  return api<PurchaseOrder>(`/procurement/purchase-orders/${id}`, {
    method: "GET",
    auth: true,
  });
}

/**
 * PATCH /procurement/purchase-orders/:id
 */
export function updatePurchaseOrder(id: UUID, dto: UpdatePurchaseOrderDto) {
  return api<PurchaseOrder>(`/procurement/purchase-orders/${id}`, {
    method: "PATCH",
    auth: true,
    json: dto,
  });
}

/**
 * DELETE /procurement/purchase-orders/:id  (cancel)
 */
export function cancelPurchaseOrder(id: UUID) {
  return api<{ message?: string }>(`/procurement/purchase-orders/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
