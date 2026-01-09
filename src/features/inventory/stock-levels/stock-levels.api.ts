import { api } from "@/lib/api";
import type { StockLevelRow, StockLevelsQuery } from "./stock-levels.types";

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
 * GET /inventory/stock-levels
 */
export function listStockLevels(query: StockLevelsQuery = {}) {
  const qs = buildQuery({
    branchId: query.branchId,
    categoryId: query.categoryId,
    q: query.q,
    belowMin: query.belowMin,
    withReserved: query.withReserved,
  });

  return api<StockLevelRow[]>(`/inventory/stock-levels${qs}`, { method: "GET", auth: true });
}

/**
 * GET /inventory/stock-levels/alerts
 */
export function listStockAlerts(params?: { branchId?: string; withReserved?: boolean }) {
  const qs = buildQuery({
    branchId: params?.branchId,
    withReserved: params?.withReserved,
  });

  return api<StockLevelRow[]>(`/inventory/stock-levels/alerts${qs}`, { method: "GET", auth: true });
}
