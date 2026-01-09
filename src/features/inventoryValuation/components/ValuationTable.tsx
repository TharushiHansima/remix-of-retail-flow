import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { ValuationRow, AgingBucket, CostingMethod } from "../types";

interface ValuationTableProps {
  rows: ValuationRow[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onReset?: () => void;
  onViewProduct: (productId: string) => void;
}

// LKR currency formatter
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-LK").format(value);

// Aging bucket badge variant
const getAgingBadgeVariant = (bucket: AgingBucket): "default" | "secondary" | "destructive" | "outline" => {
  switch (bucket) {
    case "0-30":
      return "default";
    case "31-60":
      return "secondary";
    case "61-90":
      return "outline";
    case "90+":
      return "destructive";
    default:
      return "secondary";
  }
};

// Costing method badge
const getCostingBadgeVariant = (method: CostingMethod): "default" | "secondary" => {
  return method === "FIFO" ? "default" : "secondary";
};

export function ValuationTable({
  rows,
  isLoading,
  isError,
  onRetry,
  onReset,
  onViewProduct,
}: ValuationTableProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">On-hand Qty</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-right">Stock Value</TableHead>
              <TableHead>Aging</TableHead>
              <TableHead>Costing</TableHead>
              <TableHead className="w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-8 w-16" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-md border p-8">
        <EmptyState
          icon={<span className="text-destructive text-4xl">⚠️</span>}
          title="Error loading valuation data"
          description="Something went wrong while fetching the inventory valuation."
          action={onRetry ? { label: "Retry", onClick: onRetry } : undefined}
        />
      </div>
    );
  }

  // Empty state
  if (rows.length === 0) {
    return (
      <div className="rounded-md border p-8">
        <EmptyState
          icon={<span className="text-muted-foreground text-4xl">📦</span>}
          title="No products found"
          description="No products match your current filters. Try adjusting your search criteria."
          action={onReset ? { label: "Reset Filters", onClick: onReset } : undefined}
        />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px] sticky left-0 bg-background">Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead className="text-right">On-hand Qty</TableHead>
            <TableHead className="text-right">Unit Cost</TableHead>
            <TableHead className="text-right">Stock Value</TableHead>
            <TableHead>Aging</TableHead>
            <TableHead>Costing</TableHead>
            <TableHead className="w-[80px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onViewProduct(row.productId)}
            >
              <TableCell className="sticky left-0 bg-background">
                <div className="space-y-0.5">
                  <div className="font-medium">{row.productName}</div>
                  <div className="text-sm text-muted-foreground">{row.sku}</div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.categoryName || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.supplierName || "—"}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatNumber(row.onHandQty)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(row.unitCost)}
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(row.stockValue)}
              </TableCell>
              <TableCell>
                <Badge variant={getAgingBadgeVariant(row.agingBucket)}>
                  {row.agingBucket === "90+" ? "90+" : row.agingBucket} days
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getCostingBadgeVariant(row.costingMethod)}>
                  {row.costingMethod === "MOVING_AVG" ? "Mov Avg" : row.costingMethod}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProduct(row.productId);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
