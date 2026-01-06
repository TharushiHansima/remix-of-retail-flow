import { api } from "@/lib/api";
import type { Category, CategoryTreeNode, CreateCategoryDto, UpdateCategoryDto } from "./categories.types";

/**
 * GET /inventory/categories
 */
export function listCategories() {
  return api<Category[]>("/inventory/categories", { method: "GET", auth: true });
}

/**
 * GET /inventory/categories/tree
 */
export function getCategoriesTree() {
  return api<CategoryTreeNode[]>("/inventory/categories/tree", { method: "GET", auth: true });
}

/**
 * POST /inventory/categories
 */
export function createCategory(dto: CreateCategoryDto) {
  return api<Category>("/inventory/categories", { method: "POST", auth: true, json: dto });
}

/**
 * PATCH /inventory/categories/:id
 */
export function updateCategory(id: string, dto: UpdateCategoryDto) {
  return api<Category>(`/inventory/categories/${id}`, { method: "PATCH", auth: true, json: dto });
}

/**
 * PATCH /inventory/categories/:id/disable
 */
export function disableCategory(id: string) {
  return api<Category>(`/inventory/categories/${id}/disable`, { method: "PATCH", auth: true });
}
