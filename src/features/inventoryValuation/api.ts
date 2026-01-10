// Mock API for Inventory Valuation

import type {
  ValuationRow,
  ValuationFilters,
  ValuationSummary,
  ProductValuationDetails,
} from "./types";
import {
  mockValuationRows,
  mockBranches,
  mockLocations,
  mockCategories,
  mockSuppliers,
  getProductValuationDetails,
  getValuationForDate,
  getAvailableSnapshotDates,
} from "./mock";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Get valuation list with filters
export async function getValuation(
  filters: ValuationFilters = {}
): Promise<{ rows: ValuationRow[]; summary: ValuationSummary }> {
  await delay(800); // Simulate network

  // Get data based on asOfDate - this enables historical snapshots
  let rows = filters.asOfDate 
    ? [...getValuationForDate(filters.asOfDate)]
    : [...mockValuationRows];

  const today = new Date().toISOString().split("T")[0];
  const isHistorical = filters.asOfDate && filters.asOfDate < today;

  // Apply filters
  if (filters.branchId) {
    rows = rows.filter((r) => r.branchId === filters.branchId);
  }

  if (filters.locationId) {
    rows = rows.filter((r) => r.locationId === filters.locationId);
  }

  if (filters.categoryId) {
    rows = rows.filter((r) => r.categoryId === filters.categoryId);
  }

  if (filters.supplierId) {
    rows = rows.filter((r) => r.supplierId === filters.supplierId);
  }

  if (filters.agingBucket && filters.agingBucket !== "ALL") {
    rows = rows.filter((r) => r.agingBucket === filters.agingBucket);
  }

  if (filters.costingMethod) {
    rows = rows.filter((r) => r.costingMethod === filters.costingMethod);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.productName.toLowerCase().includes(searchLower) ||
        r.sku.toLowerCase().includes(searchLower)
    );
  }

  // Calculate summary
  const summary: ValuationSummary = {
    totalSkus: rows.length,
    totalOnHandQty: rows.reduce((sum, r) => sum + r.onHandQty, 0),
    totalStockValue: rows.reduce((sum, r) => sum + r.stockValue, 0),
    averageUnitCost:
      rows.length > 0
        ? rows.reduce((sum, r) => sum + r.unitCost, 0) / rows.length
        : 0,
    snapshotDate: filters.asOfDate || today,
    isHistorical: !!isHistorical,
  };

  return { rows, summary };
}

// Get product valuation details
export async function getProductValuation(
  productId: string,
  filters?: ValuationFilters
): Promise<ProductValuationDetails | null> {
  await delay(600); // Simulate network
  return getProductValuationDetails(productId, filters?.asOfDate);
}

// Get available snapshot dates for historical reporting
export async function getSnapshotDates(): Promise<string[]> {
  await delay(200);
  return getAvailableSnapshotDates();
}

// Get reference data
export async function getBranches() {
  await delay(200);
  return mockBranches;
}

export async function getLocations(branchId?: string) {
  await delay(200);
  if (branchId) {
    return mockLocations.filter((l) => l.branchId === branchId);
  }
  return mockLocations;
}

export async function getCategories() {
  await delay(200);
  return mockCategories;
}

export async function getSuppliers() {
  await delay(200);
  return mockSuppliers;
}

// Export CSV data
export function generateValuationCSV(rows: ValuationRow[]): string {
  const headers = [
    "Product Name",
    "SKU",
    "Category",
    "Supplier",
    "Branch",
    "Location",
    "On-hand Qty",
    "Unit Cost (LKR)",
    "Stock Value (LKR)",
    "Aging Bucket",
    "Costing Method",
    "Last Receipt Date",
  ];

  const csvRows = rows.map((r) => [
    `"${r.productName}"`,
    r.sku,
    r.categoryName || "",
    r.supplierName || "",
    r.branchName || "",
    r.locationName || "",
    r.onHandQty,
    r.unitCost,
    r.stockValue,
    r.agingBucket,
    r.costingMethod,
    r.lastReceiptDate || "",
  ]);

  return [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
}
