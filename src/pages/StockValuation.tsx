import { useState, useCallback } from "react";
import { RefreshCw, Download, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ValuationFilters as ValuationFiltersComponent,
  ValuationSummaryCards,
  ValuationTable,
  ProductValuationDrawer,
} from "@/features/inventoryValuation/components";
import {
  useValuation,
  useProductValuation,
  useBranches,
  useLocations,
  useCategories,
  useSuppliers,
} from "@/features/inventoryValuation/hooks";
import { generateValuationCSV } from "@/features/inventoryValuation/api";
import type { ValuationFilters } from "@/features/inventoryValuation/types";
import { format } from "date-fns";

const defaultFilters: ValuationFilters = {
  agingBucket: "ALL",
};

export default function StockValuation() {
  const [filters, setFilters] = useState<ValuationFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<ValuationFilters>(defaultFilters);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch data
  const { data, isLoading, isError, refetch } = useValuation(appliedFilters);
  const { data: productDetails, isLoading: isLoadingProduct } = useProductValuation(
    selectedProductId,
    appliedFilters
  );
  const { data: branches = [] } = useBranches();
  const { data: locations = [] } = useLocations(filters.branchId);
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();

  const isHistorical = data?.summary?.isHistorical;
  const snapshotDate = data?.summary?.snapshotDate;

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  }, []);

  const handleViewProduct = useCallback((productId: string) => {
    setSelectedProductId(productId);
    setDrawerOpen(true);
  }, []);

  const handleExportCSV = useCallback(() => {
    if (!data?.rows) return;
    const csv = generateValuationCSV(data.rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const dateStr = snapshotDate || new Date().toISOString().split("T")[0];
    link.href = URL.createObjectURL(blob);
    link.download = `inventory-valuation-${dateStr}.csv`;
    link.click();
  }, [data?.rows, snapshotDate]);

  const formatDisplayDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Stock Valuation</h1>
            {isHistorical && snapshotDate && (
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Historical Snapshot
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {isHistorical && snapshotDate
              ? `Point-in-time valuation as of ${formatDisplayDate(snapshotDate)}`
              : "Inventory value and costing breakdown (FIFO / Moving Avg)"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={!data?.rows?.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Historical data notice */}
      {isHistorical && snapshotDate && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are viewing a <strong>historical snapshot</strong> of inventory valuation as of{" "}
            <strong>{formatDisplayDate(snapshotDate)}</strong>. This data reflects the stock levels and 
            values at that point in time.{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto font-medium" 
              onClick={handleResetFilters}
            >
              View current data
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <ValuationFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        branches={branches}
        locations={locations}
        categories={categories}
        suppliers={suppliers}
        isLoading={isLoading}
      />

      {/* Summary Cards */}
      <ValuationSummaryCards summary={data?.summary || null} isLoading={isLoading} />

      {/* Error Alert */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load valuation data.{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <ValuationTable
        rows={data?.rows || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onReset={handleResetFilters}
        onViewProduct={handleViewProduct}
      />

      {/* Product Details Drawer */}
      <ProductValuationDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        productDetails={productDetails || null}
        isLoading={isLoadingProduct}
      />
    </div>
  );
}
