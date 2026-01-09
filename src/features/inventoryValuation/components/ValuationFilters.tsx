import { Search, RotateCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ValuationFilters, CostingMethod, AgingBucket, Branch, Location, Category, Supplier } from "../types";

interface ValuationFiltersProps {
  filters: ValuationFilters;
  onFiltersChange: (filters: ValuationFilters) => void;
  onApply: () => void;
  onReset: () => void;
  branches: Branch[];
  locations: Location[];
  categories: Category[];
  suppliers: Supplier[];
  isLoading?: boolean;
}

const AGING_BUCKETS: { value: AgingBucket; label: string }[] = [
  { value: "ALL", label: "All Ages" },
  { value: "0-30", label: "0-30 days" },
  { value: "31-60", label: "31-60 days" },
  { value: "61-90", label: "61-90 days" },
  { value: "90+", label: "90+ days" },
];

const COSTING_METHODS: { value: CostingMethod | ""; label: string }[] = [
  { value: "", label: "All Methods" },
  { value: "FIFO", label: "FIFO" },
  { value: "MOVING_AVG", label: "Moving Avg" },
];

export function ValuationFilters({
  filters,
  onFiltersChange,
  onApply,
  onReset,
  branches,
  locations,
  categories,
  suppliers,
  isLoading,
}: ValuationFiltersProps) {
  const updateFilter = <K extends keyof ValuationFilters>(
    key: K,
    value: ValuationFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* First row: Main filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.branchId || "all"}
          onValueChange={(v) => updateFilter("branchId", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.locationId || "all"}
          onValueChange={(v) => updateFilter("locationId", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.categoryId || "all"}
          onValueChange={(v) => updateFilter("categoryId", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.supplierId || "all"}
          onValueChange={(v) => updateFilter("supplierId", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Supplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Second row: More filters + search + actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.agingBucket || "ALL"}
          onValueChange={(v) => updateFilter("agingBucket", v as AgingBucket)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Aging" />
          </SelectTrigger>
          <SelectContent>
            {AGING_BUCKETS.map((b) => (
              <SelectItem key={b.value} value={b.value}>
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.costingMethod || ""}
          onValueChange={(v) =>
            updateFilter("costingMethod", v ? (v as CostingMethod) : undefined)
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Costing" />
          </SelectTrigger>
          <SelectContent>
            {COSTING_METHODS.map((m) => (
              <SelectItem key={m.value || "all"} value={m.value || "all-methods"}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={filters.asOfDate || ""}
          onChange={(e) => updateFilter("asOfDate", e.target.value || undefined)}
          className="w-[160px]"
          placeholder="As of date"
        />

        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name / SKU"
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value || undefined)}
              className="pl-9"
            />
          </div>
        </div>

        <Button variant="outline" onClick={onReset} disabled={isLoading}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>

        <Button onClick={onApply} disabled={isLoading}>
          <Filter className="h-4 w-4 mr-2" />
          Apply
        </Button>
      </div>
    </div>
  );
}
