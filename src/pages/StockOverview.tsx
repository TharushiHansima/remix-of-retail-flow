import { useEffect, useMemo, useState } from "react";
import { Package, AlertTriangle, TrendingUp, TrendingDown, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { listBranches } from "@/features/branches/branches.api";
import type { Branch } from "@/features/branches/branches.types";

import { listProducts } from "@/features/inventory/products/products.api";
import type { Product as ApiProduct } from "@/features/inventory/products/products.types";

import { listStockLevels } from "@/features/inventory/stock-levels/stock-levels.api";
import type { StockLevelRow } from "@/features/inventory/stock-levels/stock-levels.types";

function toNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function normalizeProducts(res: any): { items: ApiProduct[]; meta?: any } {
  if (Array.isArray(res)) return { items: res };
  if (res?.data && Array.isArray(res.data)) return { items: res.data, meta: res.meta };
  if (res?.items && Array.isArray(res.items)) return { items: res.items, meta: res };
  return { items: [] };
}

async function fetchAllProductsForPricing(): Promise<Map<string, { costPrice: number; sellingPrice: number }>> {
  const map = new Map<string, { costPrice: number; sellingPrice: number }>();
  const pageSize = 100;
  let page = 1;

  while (true) {
    const res = await listProducts({ page, pageSize });
    const { items, meta } = normalizeProducts(res);

    for (const p of items) {
      map.set(p.id, {
        costPrice: toNumber((p as any).costPrice),
        sellingPrice: toNumber((p as any).sellingPrice ?? (p as any).unitPrice),
      });
    }

    const totalPages = Number(meta?.totalPages ?? 0);
    if (totalPages > 0) {
      if (page >= totalPages) break;
      page += 1;
      continue;
    }

    if (items.length < pageSize) break;
    page += 1;

    if (page > 200) break; // safety cap
  }

  return map;
}

type StockRow = {
  id: string;
  sku: string;
  name: string;
  categoryId?: string | null;
  category: string;
  brand: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  reserved: number;
  costPrice: number;
  sellingPrice: number;
};

export default function StockOverview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all"); // 'all' or branchId
  const [selectedCategory, setSelectedCategory] = useState("all"); // 'all' or categoryId
  const [stockFilter, setStockFilter] = useState("all");

  const [branches, setBranches] = useState<Branch[]>([]);
  const [rows, setRows] = useState<StockLevelRow[]>([]);
  const [pricingByProductId, setPricingByProductId] = useState<Map<string, { costPrice: number; sellingPrice: number }>>(new Map());
  const [loading, setLoading] = useState(true);

  // Load branches + pricing once
  useEffect(() => {
    let alive = true;

    void (async () => {
      try {
        setLoading(true);
        const [branchList, pricing] = await Promise.all([
          listBranches(),
          fetchAllProductsForPricing(),
        ]);
        if (!alive) return;

        setBranches(branchList ?? []);
        setPricingByProductId(pricing);
      } catch (e: any) {
        if (!alive) return;
        toast.error(e?.message || "Failed to initialize stock overview");
        setBranches([]);
        setPricingByProductId(new Map());
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Load stock-levels when branch changes (and on first load)
  useEffect(() => {
    let alive = true;

    void (async () => {
      try {
        setLoading(true);

        const data = await listStockLevels({
          branchId: selectedBranch !== "all" ? selectedBranch : undefined,
          withReserved: true,
        });

        if (!alive) return;
        setRows(data ?? []);
      } catch (e: any) {
        if (!alive) return;
        toast.error(e?.message || "Failed to load stock levels");
        setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedBranch]);

  const branchOptions = useMemo(
    () => [{ id: "all", name: "All Branches" }, ...branches.map((b) => ({ id: b.id, name: b.name }))],
    [branches]
  );

  // Aggregate rows if All Branches (one row per product)
  const baseData: StockRow[] = useMemo(() => {
    if (selectedBranch !== "all") {
      return rows.map((r) => {
        const price = pricingByProductId.get(r.productId);
        return {
          id: r.productId,
          sku: (r.product?.sku || "-").toString(),
          name: r.product?.name || "-",
          categoryId: r.product?.category?.id || r.product?.categoryId || null,
          category: r.product?.category?.name || "-",
          brand: r.product?.brand?.name || "-",
          quantity: toNumber(r.stockQty),
          reserved: toNumber(r.reservedQty),
          minStock: toNumber(r.minStock),
          maxStock: toNumber(r.maxStock),
          costPrice: toNumber(price?.costPrice),
          sellingPrice: toNumber(price?.sellingPrice),
        };
      });
    }

    // All branches: group by productId
    const byProduct = new Map<string, StockRow>();

    for (const r of rows) {
      const existing = byProduct.get(r.productId);
      const price = pricingByProductId.get(r.productId);

      const sku = (r.product?.sku || "-").toString();
      const name = r.product?.name || "-";
      const categoryId = r.product?.category?.id || r.product?.categoryId || null;
      const category = r.product?.category?.name || "-";
      const brand = r.product?.brand?.name || "-";

      if (!existing) {
        byProduct.set(r.productId, {
          id: r.productId,
          sku,
          name,
          categoryId,
          category,
          brand,
          quantity: toNumber(r.stockQty),
          reserved: toNumber(r.reservedQty),
          minStock: toNumber(r.minStock),
          maxStock: toNumber(r.maxStock),
          costPrice: toNumber(price?.costPrice),
          sellingPrice: toNumber(price?.sellingPrice),
        });
      } else {
        existing.quantity += toNumber(r.stockQty);
        existing.reserved += toNumber(r.reservedQty);
        existing.minStock += toNumber(r.minStock);
        existing.maxStock += toNumber(r.maxStock);
      }
    }

    return Array.from(byProduct.values());
  }, [rows, selectedBranch, pricingByProductId]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) {
      const id = r.product?.category?.id || r.product?.categoryId;
      const name = r.product?.category?.name;
      if (id && name) map.set(id, name);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const getStockStatus = (item: StockRow) => {
    const available = Math.max(item.quantity - item.reserved, 0);
    if (available === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (available <= item.minStock) return { label: "Low Stock", variant: "secondary" as const };
    if (item.maxStock > 0 && available >= item.maxStock * 0.9) return { label: "Overstocked", variant: "outline" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const getStockLevel = (item: StockRow) => {
    const denom = item.maxStock > 0 ? item.maxStock : Math.max(item.quantity, 1);
    return Math.min((item.quantity / denom) * 100, 100);
  };

  const filteredData = useMemo(() => {
    return baseData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || item.categoryId === selectedCategory;

      const status = getStockStatus(item);
      const matchesStockFilter =
        stockFilter === "all" ||
        (stockFilter === "low" && status.label === "Low Stock") ||
        (stockFilter === "out" && status.label === "Out of Stock") ||
        (stockFilter === "over" && status.label === "Overstocked");

      return matchesSearch && matchesCategory && matchesStockFilter;
    });
  }, [baseData, searchTerm, selectedCategory, stockFilter]);

  const totalItems = baseData.length;
  const lowStockItems = baseData.filter((i) => getStockStatus(i).label === "Low Stock").length;
  const outOfStockItems = baseData.filter((i) => getStockStatus(i).label === "Out of Stock").length;
  const totalValue = baseData.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Overview</h1>
          <p className="text-muted-foreground">Monitor stock levels across all products</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalItems}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <TrendingDown className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowStockItems}</p>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{outOfStockItems}</p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Stock Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Stock Levels</CardTitle>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branchOptions.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
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

              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                  <SelectItem value="over">Overstocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9}>Loading...</TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>No stock data found</TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => {
                  const status = getStockStatus(item);
                  const available = Math.max(item.quantity - item.reserved, 0);

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.brand}</TableCell>
                      <TableCell>{available}</TableCell>
                      <TableCell>{item.reserved}</TableCell>
                      <TableCell className="w-32">
                        <div className="space-y-1">
                          <Progress
                            value={getStockLevel(item)}
                            className={`h-2 ${
                              status.label === "Out of Stock"
                                ? "[&>div]:bg-destructive"
                                : status.label === "Low Stock"
                                  ? "[&>div]:bg-yellow-500"
                                  : ""
                            }`}
                          />
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} / {item.maxStock}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${(item.quantity * item.costPrice).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
