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
type PurchaseOrderDetailResponse =
  | PurchaseOrder
  | { data?: PurchaseOrder }
  | { item?: PurchaseOrder }
  | { purchaseOrder?: PurchaseOrder };

export async function getPurchaseOrder(id: UUID) {
  const res = await api<PurchaseOrderDetailResponse>(`/procurement/purchase-orders/${id}`, {
    method: "GET",
    auth: true,
  });

  const detail =
    (res as { data?: PurchaseOrder }).data ??
    (res as { item?: PurchaseOrder }).item ??
    (res as { purchaseOrder?: PurchaseOrder }).purchaseOrder ??
    (res as PurchaseOrder);

  const rawItems =
    (detail as any)?.items ??
    (detail as any)?.purchaseOrderItems ??
    (detail as any)?.poItems ??
    (detail as any)?.lineItems ??
    (detail as any)?.lines ??
    [];

  if (detail && !(detail as any).items && Array.isArray(rawItems)) {
    return { ...(detail as PurchaseOrder), items: rawItems };
  }

  return detail as PurchaseOrder;
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
