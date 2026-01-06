import { http } from "@/lib/http";
import type { Brand, CreateBrandInput, UpdateBrandInput } from "./brands.types";

export function listBrands(params?: { includeDisabled?: boolean }) {
  const qs = params?.includeDisabled ? "?includeDisabled=true" : "";
  return http<Brand[]>(`/inventory/brands${qs}`, { method: "GET", auth: true });
}

export function createBrand(input: CreateBrandInput) {
  return http<Brand>("/inventory/brands", {
    method: "POST",
    auth: true,
    json: input,
  });
}

export function updateBrand(id: string, input: UpdateBrandInput) {
  return http<Brand>(`/inventory/brands/${id}`, {
    method: "PATCH",
    auth: true,
    json: input,
  });
}

export function disableBrand(id: string) {
  return http<Brand>(`/inventory/brands/${id}/disable`, {
    method: "PATCH",
    auth: true,
  });
}
