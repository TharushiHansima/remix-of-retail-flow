import { useState } from "react";
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

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
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

const products: Product[] = [
  {
    id: "1",
    sku: "APL-IP15PM-256",
    name: "iPhone 15 Pro Max 256GB",
    category: "Smartphones",
    brand: "Apple",
    type: "serialized",
    price: 1199,
    cost: 950,
    stock: { main: 5, downtown: 3, warehouse: 12 },
    status: "active",
  },
  {
    id: "2",
    sku: "SAM-S24U-256",
    name: "Samsung Galaxy S24 Ultra",
    category: "Smartphones",
    brand: "Samsung",
    type: "serialized",
    price: 1099,
    cost: 850,
    stock: { main: 8, downtown: 5, warehouse: 15 },
    status: "active",
  },
  {
    id: "3",
    sku: "APL-MBP14-M3",
    name: "MacBook Pro 14\" M3",
    category: "Laptops",
    brand: "Apple",
    type: "serialized",
    price: 1999,
    cost: 1600,
    stock: { main: 2, downtown: 1, warehouse: 5 },
    status: "low_stock",
  },
  {
    id: "4",
    sku: "APL-APP2",
    name: "AirPods Pro 2nd Gen",
    category: "Accessories",
    brand: "Apple",
    type: "standard",
    price: 249,
    cost: 180,
    stock: { main: 15, downtown: 10, warehouse: 30 },
    status: "active",
  },
  {
    id: "5",
    sku: "ACC-USBC-65W",
    name: "USB-C Fast Charger 65W",
    category: "Accessories",
    brand: "Generic",
    type: "batch",
    price: 45,
    cost: 22,
    stock: { main: 25, downtown: 20, warehouse: 100 },
    status: "active",
  },
  {
    id: "6",
    sku: "SAM-TAB-S9",
    name: "Samsung Galaxy Tab S9",
    category: "Tablets",
    brand: "Samsung",
    type: "serialized",
    price: 849,
    cost: 650,
    stock: { main: 0, downtown: 0, warehouse: 2 },
    status: "low_stock",
  },
];

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

export default function Products() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
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
        <Select>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="smartphones">Smartphones</SelectItem>
            <SelectItem value="laptops">Laptops</SelectItem>
            <SelectItem value="tablets">Tablets</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Brands</SelectItem>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="samsung">Samsung</SelectItem>
            <SelectItem value="generic">Generic</SelectItem>
          </SelectContent>
        </Select>
        <Select>
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
                  checked={selectedProducts.length === products.length}
                  onCheckedChange={toggleSelectAll}
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
            {filteredProducts.map((product) => (
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
      <AddProductDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <ViewProductDialog 
        open={viewDialogOpen} 
        onOpenChange={setViewDialogOpen} 
        product={selectedProduct} 
      />
      <EditProductDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        product={selectedProduct} 
      />
      <DeleteProductDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        product={selectedProduct} 
      />
    </div>
  );
}
