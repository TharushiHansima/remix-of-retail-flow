import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TableSkeleton } from "@/components/ui/table-skeleton";

type ProfitMarginItem = {
  productId: string;
  productName: string;
  productSku: string;
  categoryName: string | null;
  costingMethod: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  grossMarginPercent: number;
  avgSellingPrice: number;
  avgCostPrice: number;
};

type MarginSummary = {
  totalRevenue: number;
  totalCOGS: number;
  totalGrossProfit: number;
  avgMarginPercent: number;
  topPerformer: string | null;
  lowPerformer: string | null;
};

async function fetchProfitMarginData(
  categoryId?: string,
  search?: string
): Promise<{ items: ProfitMarginItem[]; summary: MarginSummary }> {
  // Get invoice items with product and invoice data
  let query = supabase
    .from("invoice_items")
    .select(`
      id,
      quantity,
      unit_price,
      total,
      product_id,
      products!inner (
        id,
        name,
        sku,
        cost_price,
        costing_method,
        category_id,
        categories ( name )
      ),
      invoices!inner ( status )
    `)
    .eq("invoices.status", "completed");

  const { data: invoiceItems, error } = await query;
  if (error) throw error;

  // Group by product and calculate margins
  const productMap = new Map<string, {
    productId: string;
    productName: string;
    productSku: string;
    categoryName: string | null;
    categoryId: string | null;
    costingMethod: string;
    totalQuantity: number;
    totalRevenue: number;
    totalCostValue: number;
    costPrice: number;
  }>();

  for (const item of invoiceItems || []) {
    const product = item.products as any;
    if (!product) continue;

    const productId = product.id;
    const existing = productMap.get(productId);
    const quantity = item.quantity || 0;
    const revenue = Number(item.total) || 0;
    const costPrice = Number(product.cost_price) || 0;
    const costValue = quantity * costPrice;

    if (existing) {
      existing.totalQuantity += quantity;
      existing.totalRevenue += revenue;
      existing.totalCostValue += costValue;
    } else {
      productMap.set(productId, {
        productId,
        productName: product.name,
        productSku: product.sku,
        categoryName: product.categories?.name || null,
        categoryId: product.category_id,
        costingMethod: product.costing_method || "weighted_average",
        totalQuantity: quantity,
        totalRevenue: revenue,
        totalCostValue: costValue,
        costPrice,
      });
    }
  }

  // Convert to array and calculate margins
  let items: ProfitMarginItem[] = Array.from(productMap.values()).map((p) => {
    const grossProfit = p.totalRevenue - p.totalCostValue;
    const grossMarginPercent = p.totalRevenue > 0 
      ? (grossProfit / p.totalRevenue) * 100 
      : 0;
    const avgSellingPrice = p.totalQuantity > 0 
      ? p.totalRevenue / p.totalQuantity 
      : 0;
    const avgCostPrice = p.totalQuantity > 0 
      ? p.totalCostValue / p.totalQuantity 
      : p.costPrice;

    return {
      productId: p.productId,
      productName: p.productName,
      productSku: p.productSku,
      categoryName: p.categoryName,
      costingMethod: p.costingMethod,
      totalQuantitySold: p.totalQuantity,
      totalRevenue: p.totalRevenue,
      totalCOGS: p.totalCostValue,
      grossProfit,
      grossMarginPercent,
      avgSellingPrice,
      avgCostPrice,
    };
  });

  // Apply filters
  if (categoryId && categoryId !== "all") {
    const catProducts = Array.from(productMap.values()).filter(
      (p) => p.categoryId === categoryId
    );
    items = items.filter((i) =>
      catProducts.some((c) => c.productId === i.productId)
    );
  }

  if (search) {
    const searchLower = search.toLowerCase();
    items = items.filter(
      (i) =>
        i.productName.toLowerCase().includes(searchLower) ||
        i.productSku.toLowerCase().includes(searchLower)
    );
  }

  // Sort by gross profit descending
  items.sort((a, b) => b.grossProfit - a.grossProfit);

  // Calculate summary
  const totalRevenue = items.reduce((s, i) => s + i.totalRevenue, 0);
  const totalCOGS = items.reduce((s, i) => s + i.totalCOGS, 0);
  const totalGrossProfit = totalRevenue - totalCOGS;
  const avgMarginPercent = totalRevenue > 0 
    ? (totalGrossProfit / totalRevenue) * 100 
    : 0;

  const sortedByMargin = [...items].sort(
    (a, b) => b.grossMarginPercent - a.grossMarginPercent
  );
  const topPerformer = sortedByMargin[0]?.productName || null;
  const lowPerformer = sortedByMargin[sortedByMargin.length - 1]?.productName || null;

  return {
    items,
    summary: {
      totalRevenue,
      totalCOGS,
      totalGrossProfit,
      avgMarginPercent,
      topPerformer,
      lowPerformer,
    },
  };
}

async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");
  if (error) throw error;
  return data || [];
}

export default function ProfitMarginReport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-for-margin-report"],
    queryFn: fetchCategories,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["profit-margin-report", categoryFilter, searchQuery],
    queryFn: () => fetchProfitMarginData(categoryFilter, searchQuery),
  });

  const items = data?.items || [];
  const summary = data?.summary || {
    totalRevenue: 0,
    totalCOGS: 0,
    totalGrossProfit: 0,
    avgMarginPercent: 0,
    topPerformer: null,
    lowPerformer: null,
  };

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  function formatPercent(value: number) {
    return `${value.toFixed(1)}%`;
  }

  function getMarginColor(margin: number) {
    if (margin >= 30) return "text-[hsl(var(--success))]";
    if (margin >= 15) return "text-[hsl(var(--warning))]";
    return "text-destructive";
  }

  function getMarginBadge(margin: number) {
    if (margin >= 30) {
      return (
        <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]">
          <TrendingUp className="h-3 w-3 mr-1" />
          High
        </Badge>
      );
    }
    if (margin >= 15) {
      return (
        <Badge className="bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">
          Medium
        </Badge>
      );
    }
    return (
      <Badge className="bg-destructive/10 text-destructive">
        <TrendingDown className="h-3 w-3 mr-1" />
        Low
      </Badge>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Profit Margin Report
          </h1>
          <p className="text-muted-foreground">
            Analyze gross profit margins using FIFO/weighted average COGS
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total COGS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {formatCurrency(summary.totalCOGS)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Gross Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[hsl(var(--success))]">
              {formatCurrency(summary.totalGrossProfit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Avg Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${getMarginColor(summary.avgMarginPercent)}`}>
              {formatPercent(summary.avgMarginPercent)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton columns={9} rows={8} />
        ) : error ? (
          <div className="p-8 text-center text-destructive">
            Failed to load data: {String(error)}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Costing</TableHead>
                <TableHead className="text-right">Qty Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">COGS</TableHead>
                <TableHead className="text-right">Gross Profit</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No sales data found
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.productId} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.productSku}
                    </TableCell>
                    <TableCell>{item.categoryName || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.costingMethod === "fifo"
                            ? "border-[hsl(var(--info))] text-[hsl(var(--info))]"
                            : "border-muted-foreground text-muted-foreground"
                        }
                      >
                        {item.costingMethod === "fifo" ? "FIFO" : "Wgt Avg"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.totalQuantitySold}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      {formatCurrency(item.totalCOGS)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-[hsl(var(--success))]">
                      {formatCurrency(item.grossProfit)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={getMarginColor(item.grossMarginPercent)}>
                          {formatPercent(item.grossMarginPercent)}
                        </span>
                        {getMarginBadge(item.grossMarginPercent)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Insights */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Top Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-[hsl(var(--success))]">
                {summary.topPerformer || "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                Highest profit margin product
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-destructive">
                {summary.lowPerformer || "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                Lowest profit margin product
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
