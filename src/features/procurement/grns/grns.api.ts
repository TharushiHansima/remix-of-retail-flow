import { api } from "@/lib/api";
import type { CreateGrnDto } from "./grns.types";

/**
 * POST /procurement/grns
 */
export function createGrn(dto: CreateGrnDto) {
  return api<unknown>("/procurement/grns", { method: "POST", auth: true, json: dto });
}

