// TanStack Query hooks for Inventory Valuation

import { useQuery } from "@tanstack/react-query";
import type { ValuationFilters } from "./types";
import {
  getValuation,
  getProductValuation,
  getBranches,
  getLocations,
  getCategories,
  getSuppliers,
} from "./api";

// Query keys
export const valuationKeys = {
  all: ["inventoryValuation"] as const,
  list: (filters: ValuationFilters) =>
    [...valuationKeys.all, "list", filters] as const,
  detail: (productId: string, filters?: ValuationFilters) =>
    [...valuationKeys.all, "detail", productId, filters] as const,
  branches: () => [...valuationKeys.all, "branches"] as const,
  locations: (branchId?: string) =>
    [...valuationKeys.all, "locations", branchId] as const,
  categories: () => [...valuationKeys.all, "categories"] as const,
  suppliers: () => [...valuationKeys.all, "suppliers"] as const,
};

// Hook to get valuation list
export function useValuation(filters: ValuationFilters = {}) {
  return useQuery({
    queryKey: valuationKeys.list(filters),
    queryFn: () => getValuation(filters),
  });
}

// Hook to get product valuation details
export function useProductValuation(
  productId: string | null,
  filters?: ValuationFilters
) {
  return useQuery({
    queryKey: valuationKeys.detail(productId || "", filters),
    queryFn: () => getProductValuation(productId!, filters),
    enabled: !!productId,
  });
}

// Hook to get branches
export function useBranches() {
  return useQuery({
    queryKey: valuationKeys.branches(),
    queryFn: getBranches,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get locations
export function useLocations(branchId?: string) {
  return useQuery({
    queryKey: valuationKeys.locations(branchId),
    queryFn: () => getLocations(branchId),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to get categories
export function useCategories() {
  return useQuery({
    queryKey: valuationKeys.categories(),
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to get suppliers
export function useSuppliers() {
  return useQuery({
    queryKey: valuationKeys.suppliers(),
    queryFn: getSuppliers,
    staleTime: 5 * 60 * 1000,
  });
}
