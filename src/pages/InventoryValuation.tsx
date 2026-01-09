import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Calendar,
  Download,
  Package,
  DollarSign,
  TrendingUp,
  Layers,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useStockValuation, useValuationSummary, useAgingAnalysis } from "@/features/inventory/valuation/useValuation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AgingBucket, CostingMethod } from "@/features/inventory/valuation/valuation.types";

const AGING_COLORS = {
  "0-30": "hsl(var(--chart-1))",
  "31-60": "hsl(var(--chart-2))",
  "61-90": "hsl(var(--chart-3))",
  "90+": "hsl(var(--chart-4))",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

export default function InventoryValuation() {
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [agingFilter, setAgingFilter] = useState<string>("all");
  const [costingMethodFilter, setCostingMethodFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data } = await supabase.from("branches").select("id, name").eq("is_active", true);
      return data || [];
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name");
      return data || [];
    },
  });

  // Valuation data
  const { data: valuations = [], isLoading: valuationsLoading, refetch } = useStockValuation({
    branchId: branchFilter !== "all" ? branchFilter : undefined,
    categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
    agingBucket: agingFilter !== "all" ? (agingFilter as AgingBucket) : undefined,
    search: searchQuery || undefined,
  });

  // Summary
  const { data: summary } = useValuationSummary(
    branchFilter !== "all" ? branchFilter : undefined
  );

  // Aging analysis
  const { data: agingData = [] } = useAgingAnalysis(
    branchFilter !== "all" ? branchFilter : undefined
  );

  // Filter by costing method locally
  const filteredValuations = costingMethodFilter !== "all"
    ? valuations.filter((v) => v.costingMethod === costingMethodFilter)
    : valuations;

  // Prepare pie chart data for aging
  const agingChartData = agingData.map((item) => ({
    name: `${item.bucket} days`,
    value: item.value,
    qty: item.qty,
    color: AGING_COLORS[item.bucket],
  }));

  // Prepare bar chart for costing method distribution
  const costingDistribution = [
    { name: "FIFO", count: summary?.fifoProductsCount || 0 },
    { name: "Weighted Avg", count: summary?.weightedAvgProductsCount || 0 },
  ];

  const handleExport = () => {
    // Generate CSV
    const headers = [
      "Product",
      "SKU",
      "Branch",
      "Category",
      "On Hand",
      "Reserved",
      "Available",
      "Costing Method",
      "Unit Cost",
      "Total Value",
      "Aging Bucket",
    ];
    const rows = filteredValuations.map((v) => [
      v.productName,
      v.productSku || "",
      v.branchName || "",
      v.categoryName || "",
      v.onHandQty,
      v.reservedQty,
      v.availableQty,
      v.costingMethod,
      v.unitCost.toFixed(2),
      v.totalValue.toFixed(2),
      v.agingBucket,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-valuation-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Valuation</h1>
          <p className="text-muted-foreground">
            FIFO & Weighted Average costing, landed costs, and aging analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.fifoProductsCount || 0} FIFO, {summary?.weightedAvgProductsCount || 0} Weighted Avg
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.totalStockValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.totalStockQty?.toLocaleString() || 0} units total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost/Unit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.avgCostPerUnit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aging 90+ Days</CardTitle>
            <Layers className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.aging90PlusValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Slow-moving stock value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-[200px]">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch: any) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={agingFilter} onValueChange={setAgingFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Aging Bucket" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Aging</SelectItem>
                <SelectItem value="0-30">0-30 Days</SelectItem>
                <SelectItem value="31-60">31-60 Days</SelectItem>
                <SelectItem value="61-90">61-90 Days</SelectItem>
                <SelectItem value="90+">90+ Days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={costingMethodFilter} onValueChange={setCostingMethodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Costing Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="fifo">FIFO</SelectItem>
                <SelectItem value="weighted_average">Weighted Average</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stock Value by Aging</CardTitle>
            <CardDescription>
              Distribution of inventory value by days since receipt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agingChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                  }
                >
                  {agingChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Costing Method Distribution</CardTitle>
            <CardDescription>Products by costing method</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costingDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Products" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Valuation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Valuation Details</CardTitle>
          <CardDescription>
            {filteredValuations.length} items • Total value:{" "}
            {formatCurrency(filteredValuations.reduce((sum, v) => sum + v.totalValue, 0))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {valuationsLoading ? (
            <TableSkeleton columns={10} rows={5} />
          ) : filteredValuations.length === 0 ? (
            <EmptyState
              icon={<Package className="h-12 w-12 text-muted-foreground" />}
              title="No valuation data"
              description="No products found matching the current filters"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">On Hand</TableHead>
                    <TableHead className="text-right">Reserved</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead>Costing</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead>Aging</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredValuations.map((item, index) => (
                    <TableRow key={`${item.productId}-${item.branchId}-${index}`}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.productSku || "-"}
                      </TableCell>
                      <TableCell>{item.branchName || "-"}</TableCell>
                      <TableCell>{item.categoryName || "-"}</TableCell>
                      <TableCell className="text-right">{item.onHandQty}</TableCell>
                      <TableCell className="text-right">{item.reservedQty}</TableCell>
                      <TableCell className="text-right">{item.availableQty}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.costingMethod === "fifo" ? "default" : "secondary"}
                        >
                          {item.costingMethod === "fifo" ? "FIFO" : "Wtd Avg"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitCost)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.totalValue)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.agingBucket === "90+"
                              ? "destructive"
                              : item.agingBucket === "61-90"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {item.agingBucket}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
