import { api } from "@/lib/api";
import type {
  CreateGrnDto,
  GrnListResponse,
  GrnDetailsResponse,
  GrnsQueryDto,
  UpdateGrnVerificationDto,
  AddLandedCostDto,
} from "./grns.types";

function buildQueryString(query?: Record<string, any>) {
  if (!query) return "";

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    // skip undefined/null/empty
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;

    // skip bad string values that sometimes happen
    if (value === "undefined" || value === "null") continue;

    params.set(key, String(value));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * GET /procurement/grns
 */
export function listGrns(query?: GrnsQueryDto) {
  const qs = buildQueryString(query as any);
  return api<GrnListResponse>(`/procurement/grns${qs}`, { method: "GET", auth: true });
}

/**
 * GET /procurement/grns/received
 */
export function listReceivedGrns(query?: GrnsQueryDto) {
  const qs = buildQueryString(query as any);
  return api<GrnListResponse>(`/procurement/grns/received${qs}`, { method: "GET", auth: true });
}

/**
 * GET /procurement/grns/:id
 */
export function getGrn(id: string) {
  return api<GrnDetailsResponse>(`/procurement/grns/${id}`, { method: "GET", auth: true });
}

/**
 * POST /procurement/grns
 */
export function createGrn(dto: CreateGrnDto) {
  return api<unknown>("/procurement/grns", { method: "POST", auth: true, json: dto });
}

/**
 * POST /procurement/grns/:id/receive
 */
export function receiveGrn(id: string, dto: unknown) {
  return api<unknown>(`/procurement/grns/${id}/receive`, { method: "POST", auth: true, json: dto });
}

/**
 * PATCH /procurement/grns/:id/verification
 */
export function setGrnVerification(id: string, dto: UpdateGrnVerificationDto) {
  return api<unknown>(`/procurement/grns/${id}/verification`, {
    method: "PATCH",
    auth: true,
    json: dto,
  });
}

/**
 * POST /procurement/grns/:id/landed-costs
 */
export function addGrnLandedCost(id: string, dto: AddLandedCostDto) {
  return api<unknown>(`/procurement/grns/${id}/landed-costs`, {
    method: "POST",
    auth: true,
    json: dto,
  });
}

/**
 * DELETE /procurement/grns/:id/landed-costs/:costId
 */
export function removeGrnLandedCost(id: string, costId: string) {
  return api<unknown>(`/procurement/grns/${id}/landed-costs/${costId}`, {
    method: "DELETE",
    auth: true,
  });
}
