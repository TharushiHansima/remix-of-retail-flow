import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStockValuation,
  getValuationSummary,
  listCostLayers,
  listActiveCostLayers,
  allocateLandedCosts,
  createFifoLayersFromGrn,
  updateProductCostingMethod,
  updateProductWeight,
  getAgingAnalysis,
} from "./valuation.api";
import type { ValuationQueryParams, AllocationMethod } from "./valuation.types";
import { toast } from "sonner";

// Query keys
const VALUATION_KEYS = {
  all: ["valuation"] as const,
  list: (params: ValuationQueryParams) => [...VALUATION_KEYS.all, "list", params] as const,
  summary: (branchId?: string) => [...VALUATION_KEYS.all, "summary", branchId] as const,
  costLayers: (productId: string, branchId?: string) =>
    [...VALUATION_KEYS.all, "costLayers", productId, branchId] as const,
  activeLayers: (productId: string, branchId: string) =>
    [...VALUATION_KEYS.all, "activeLayers", productId, branchId] as const,
  aging: (branchId?: string) => [...VALUATION_KEYS.all, "aging", branchId] as const,
};

// Hook to get stock valuation list
export function useStockValuation(params: ValuationQueryParams = {}) {
  return useQuery({
    queryKey: VALUATION_KEYS.list(params),
    queryFn: () => getStockValuation(params),
  });
}

// Hook to get valuation summary
export function useValuationSummary(branchId?: string) {
  return useQuery({
    queryKey: VALUATION_KEYS.summary(branchId),
    queryFn: () => getValuationSummary(branchId),
  });
}

// Hook to get cost layers for a product
export function useCostLayers(productId: string, branchId?: string) {
  return useQuery({
    queryKey: VALUATION_KEYS.costLayers(productId, branchId),
    queryFn: () => listCostLayers(productId, branchId),
    enabled: !!productId,
  });
}

// Hook to get active cost layers
export function useActiveCostLayers(productId: string, branchId: string) {
  return useQuery({
    queryKey: VALUATION_KEYS.activeLayers(productId, branchId),
    queryFn: () => listActiveCostLayers(productId, branchId),
    enabled: !!productId && !!branchId,
  });
}

// Hook to get aging analysis
export function useAgingAnalysis(branchId?: string) {
  return useQuery({
    queryKey: VALUATION_KEYS.aging(branchId),
    queryFn: () => getAgingAnalysis(branchId),
  });
}

// Mutation to allocate landed costs
export function useAllocateLandedCosts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      grnId,
      allocationMethod,
    }: {
      grnId: string;
      allocationMethod: AllocationMethod;
    }) => allocateLandedCosts(grnId, allocationMethod),
    onSuccess: () => {
      toast.success("Landed costs allocated successfully");
      queryClient.invalidateQueries({ queryKey: ["grn"] });
      queryClient.invalidateQueries({ queryKey: VALUATION_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(`Failed to allocate landed costs: ${error.message}`);
    },
  });
}

// Mutation to create FIFO layers from GRN
export function useCreateFifoLayers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (grnId: string) => createFifoLayersFromGrn(grnId),
    onSuccess: () => {
      toast.success("FIFO cost layers created");
      queryClient.invalidateQueries({ queryKey: VALUATION_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create cost layers: ${error.message}`);
    },
  });
}

// Mutation to update product costing method
export function useUpdateCostingMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      costingMethod,
    }: {
      productId: string;
      costingMethod: "fifo" | "weighted_average";
    }) => updateProductCostingMethod(productId, costingMethod),
    onSuccess: () => {
      toast.success("Costing method updated");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: VALUATION_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update costing method: ${error.message}`);
    },
  });
}

// Mutation to update product weight
export function useUpdateProductWeight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      unitWeight,
    }: {
      productId: string;
      unitWeight: number;
    }) => updateProductWeight(productId, unitWeight),
    onSuccess: () => {
      toast.success("Product weight updated");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update weight: ${error.message}`);
    },
  });
}
