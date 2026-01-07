import { http } from "@/lib/http";
import type { Branch, CreateBranchInput, UpdateBranchInput } from "./branches.types";

// Existing (protected)
export function listBranches(params?: { includeDisabled?: boolean }) {
  const qs = params?.includeDisabled ? "?includeDisabled=true" : "";
  return http<Branch[]>(`/inventory/branches${qs}`, { method: "GET", auth: true });
}

// ✅ NEW (public for signup)
export function listPublicBranches() {
  return http<Branch[]>(`/public/branches`, { method: "GET", auth: false });
}

export function createBranch(input: CreateBranchInput) {
  return http<Branch>("/inventory/branches", {
    method: "POST",
    auth: true,
    json: input,
  });
}

export function updateBranch(id: string, input: UpdateBranchInput) {
  return http<Branch>(`/inventory/branches/${id}`, {
    method: "PATCH",
    auth: true,
    json: input,
  });
}

export function deleteBranch(id: string) {
  return http<{ success: boolean } | Branch>(`/inventory/branches/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
