// product.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { AddProductDialog } from "@/components/products/AddProductDialog";
import { ViewProductDialog } from "@/components/products/ViewProductDialog";
import { EditProductDialog } from "@/components/products/EditProductDialog";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { toast } from "sonner";
import {
  createProduct,
  disableProduct,
  listProducts,
  updateProduct,
} from "@/features/inventory/products/products.api";
import type {
  CreateProductDto,
  Product as ApiProduct,
  ProductListResponse,
  UpdateProductDto,
} from "@/features/inventory/products/products.types";
import { useCategories } from "@/features/inventory/categories/categories.hooks";
import { useBrands } from "@/features/inventory/brands/useBrands";

/* =========================
   UI Types (same UI)
   ========================= */
interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  categoryId?: string | null;
  brand: string;
  brandId?: string | null;
  type: "standard" | "serialized" | "batch";
  price: number;
  cost: number;
  stock: {
    main: number;
    downtown: number;
    warehouse: number;
  };
  status: "active" | "inactive" | "low_stock";
}

const typeLabels = {
  standard: "Standard",
  serialized: "Serialized",
  batch: "Batch",
};

const statusColors = {
  active: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  inactive: "bg-muted text-muted-foreground",
  low_stock: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
};

type StatusFilter = "all" | "active" | "inactive" | "low_stock";

function toNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function mapApiProductToUi(
  p: ApiProduct,
  lookups: { brandById: Map<string, string>; categoryById: Map<string, string> },
): Product {
  const isSerialized = !!p.isSerialized;
  const isBatched = !!p.isBatched;

  const type: Product["type"] = isSerialized ? "serialized" : isBatched ? "batch" : "standard";

  const brandId = p.brand?.id || p.brandId || null;
  const brand =
    p.brand?.name ||
    p.brandName ||
    (brandId ? lookups.brandById.get(brandId) : undefined) ||
    "-";

  const categoryId = p.category?.id || p.categoryId || null;
  const category =
    p.category?.name ||
    p.categoryName ||
    (categoryId ? lookups.categoryById.get(categoryId) : undefined) ||
    "-";

  const status: Product["status"] = p.isActive === false ? "inactive" : "active";

  return {
    id: p.id,
    sku: (p.sku || "-").toString(),
    name: p.name,
    category,
    categoryId,
    brand,
    brandId,
    type,
    price: toNumber(p.unitPrice ?? p.sellingPrice),
    cost: toNumber(p.costPrice),
    // stock is not provided by this controller; keep zeros for now
    stock: { main: 0, downtown: 0, warehouse: 0 },
    // low_stock requires stock module; keep active/inactive only
    status,
  };
}

function normalizeListResponse(res: ProductListResponse): { items: ApiProduct[]; total: number } {
  if (Array.isArray(res)) return { items: res, total: res.length };
  return { items: res.items || [], total: res.total ?? res.items?.length ?? 0 };
}

export default function Products() {
  const { categories } = useCategories();
  const { brands } = useBrands();

  const brandById = useMemo(() => new Map(brands.map((brand) => [brand.id, brand.name])), [brands]);
  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // ✅ backend data
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const applyProducts = useCallback((mapped: Product[]) => {
    setProducts(mapped);
    const ids = new Set(mapped.map((p) => p.id));
    setSelectedProducts((prev) => prev.filter((id) => ids.has(id)));
  }, []);

  const fetchAndMapProducts = useCallback(async () => {
    const isActive =
      statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined;

    const res = await listProducts({
      q: searchQuery.trim() ? searchQuery.trim() : undefined,
      brandId: brandFilter !== "all" ? brandFilter : undefined,
      categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
      isActive,
      page: 1,
      pageSize: 100,
    });

    const { items } = normalizeListResponse(res);
    return items.map((item) => mapApiProductToUi(item, { brandById, categoryById }));
  }, [searchQuery, brandFilter, categoryFilter, statusFilter, brandById, categoryById]);

  const reloadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const mapped = await fetchAndMapProducts();
      applyProducts(mapped);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load products");
      applyProducts([]);
    } finally {
      setLoading(false);
    }
  }, [fetchAndMapProducts, applyProducts]);

  // load products from backend (debounced by searchQuery/filters)
  useEffect(() => {
    let alive = true;

    const t = setTimeout(() => {
      void (async () => {
        try {
          setLoading(true);
          const mapped = await fetchAndMapProducts();
          if (!alive) return;
          applyProducts(mapped);
        } catch (e: any) {
          if (!alive) return;
          toast.error(e?.message || "Failed to load products");
          applyProducts([]);
        } finally {
          if (alive) setLoading(false);
        }
      })();
    }, 250);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [fetchAndMapProducts, applyProducts]);

  const toggleSelect = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedProducts((prev) =>
      prev.length === products.length ? [] : products.map((p) => p.id)
    );
  };

  // Keep your existing local filtering behavior (works even if backend already filtered)
  const filteredProducts = useMemo(() => {
    let result = products;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [products, searchQuery, statusFilter]);

  const handleCreateProduct = useCallback(
    async (dto: CreateProductDto) => {
      try {
        await createProduct(dto);
        toast.success("Product added successfully");
        await reloadProducts();
        return true;
      } catch (e: any) {
        toast.error(e?.message || "Failed to add product");
        return false;
      }
    },
    [reloadProducts],
  );

  const handleUpdateProduct = useCallback(
    async (id: string, dto: UpdateProductDto) => {
      try {
        await updateProduct(id, dto);
        toast.success("Product updated successfully");
        await reloadProducts();
        return true;
      } catch (e: any) {
        toast.error(e?.message || "Failed to update product");
        return false;
      }
    },
    [reloadProducts],
  );

  const handleDisableProduct = useCallback(
    async (id: string) => {
      try {
        await disableProduct(id);
        toast.success("Product disabled successfully");
        await reloadProducts();
        return true;
      } catch (e: any) {
        toast.error(e?.message || "Failed to disable product");
        return false;
      }
    },
    [reloadProducts],
  );

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setViewDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
          <span className="text-sm font-medium">
            {selectedProducts.length} selected
          </span>
          <Button variant="outline" size="sm">
            Update Status
          </Button>
          <Button variant="outline" size="sm">
            Update Category
          </Button>
          <Button variant="outline" size="sm" className="text-destructive">
            Delete
          </Button>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={products.length > 0 && selectedProducts.length === products.length}
                  onCheckedChange={() => toggleSelectAll()}
                />
              </TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Stock (M/D/W)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9}>Loading...</TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>No products found</TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleSelect(product.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[product.type]}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm">
                    {product.stock.main} / {product.stock.downtown} / {product.stock.warehouse}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[product.status]}>
                      {product.status === "low_stock" ? "Low Stock" : product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem onClick={() => handleView(product)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (UI unchanged; backend paging can be added later) */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 1-{filteredProducts.length} of {filteredProducts.length} products
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <AddProductDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        categories={categories}
        brands={brands}
        onSubmit={handleCreateProduct}
      />
      <ViewProductDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        product={selectedProduct}
      />
      <EditProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={selectedProduct}
        categories={categories}
        brands={brands}
        onSubmit={handleUpdateProduct}
      />
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={selectedProduct}
        onConfirm={handleDisableProduct}
      />
    </div>
  );
}
