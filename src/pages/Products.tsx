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
  {
    id: "7",
    sku: "APL-WATCH-S9",
    name: "Apple Watch Series 9",
    category: "Wearables",
    brand: "Apple",
    type: "serialized",
    price: 449,
    cost: 349,
    stock: { main: 12, downtown: 8, warehouse: 20 },
    status: "active",
  },
  {
    id: "8",
    sku: "GOO-PIX8-PRO",
    name: "Google Pixel 8 Pro",
    category: "Smartphones",
    brand: "Google",
    type: "serialized",
    price: 999,
    cost: 799,
    stock: { main: 6, downtown: 4, warehouse: 10 },
    status: "active",
  },
  {
    id: "9",
    sku: "SONY-WH1000",
    name: "Sony WH-1000XM5 Headphones",
    category: "Audio",
    brand: "Sony",
    type: "serialized",
    price: 399,
    cost: 299,
    stock: { main: 10, downtown: 7, warehouse: 25 },
    status: "active",
  },
  {
    id: "10",
    sku: "SAM-BUDS-PRO2",
    name: "Samsung Galaxy Buds2 Pro",
    category: "Audio",
    brand: "Samsung",
    type: "standard",
    price: 229,
    cost: 149,
    stock: { main: 18, downtown: 12, warehouse: 40 },
    status: "active",
  },
  {
    id: "11",
    sku: "APL-AIRMAX",
    name: "AirPods Max",
    category: "Audio",
    brand: "Apple",
    type: "serialized",
    price: 549,
    cost: 449,
    stock: { main: 3, downtown: 2, warehouse: 8 },
    status: "active",
  },
  {
    id: "12",
    sku: "DEL-XPS15-I7",
    name: "Dell XPS 15 i7",
    category: "Laptops",
    brand: "Dell",
    type: "serialized",
    price: 1599,
    cost: 1299,
    stock: { main: 4, downtown: 2, warehouse: 6 },
    status: "active",
  },
  {
    id: "13",
    sku: "LEN-THINK-T14",
    name: "Lenovo ThinkPad T14",
    category: "Laptops",
    brand: "Lenovo",
    type: "serialized",
    price: 1199,
    cost: 899,
    stock: { main: 5, downtown: 3, warehouse: 9 },
    status: "active",
  },
  {
    id: "14",
    sku: "LOG-MX-M3S",
    name: "Logitech MX Master 3S",
    category: "Accessories",
    brand: "Logitech",
    type: "standard",
    price: 99,
    cost: 69,
    stock: { main: 22, downtown: 15, warehouse: 50 },
    status: "active",
  },
  {
    id: "15",
    sku: "KEY-K2-V2",
    name: "Keychron K2 V2 Keyboard",
    category: "Accessories",
    brand: "Keychron",
    type: "standard",
    price: 89,
    cost: 59,
    stock: { main: 8, downtown: 5, warehouse: 20 },
    status: "active",
  },
  {
    id: "16",
    sku: "ANK-PWR-20K",
    name: "Anker PowerCore 20000mAh",
    category: "Accessories",
    brand: "Anker",
    type: "batch",
    price: 59,
    cost: 35,
    stock: { main: 30, downtown: 20, warehouse: 80 },
    status: "active",
  },
  {
    id: "17",
    sku: "TPL-WIFI6-AX",
    name: "TP-Link Archer AX50 WiFi 6",
    category: "Networking",
    brand: "TP-Link",
    type: "standard",
    price: 129,
    cost: 89,
    stock: { main: 7, downtown: 5, warehouse: 15 },
    status: "active",
  },
  {
    id: "18",
    sku: "SAM-T7-1TB",
    name: "Samsung T7 SSD 1TB",
    category: "Storage",
    brand: "Samsung",
    type: "serialized",
    price: 149,
    cost: 99,
    stock: { main: 15, downtown: 10, warehouse: 35 },
    status: "active",
  },
  {
    id: "19",
    sku: "LOG-C920-HD",
    name: "Logitech C920 HD Webcam",
    category: "Accessories",
    brand: "Logitech",
    type: "standard",
    price: 79,
    cost: 49,
    stock: { main: 12, downtown: 8, warehouse: 25 },
    status: "active",
  },
  {
    id: "20",
    sku: "APL-MAGSAFE",
    name: "Apple MagSafe Charger",
    category: "Chargers",
    brand: "Apple",
    type: "standard",
    price: 49,
    cost: 29,
    stock: { main: 35, downtown: 25, warehouse: 100 },
    status: "active",
  },
  {
    id: "21",
    sku: "ONP-12-256",
    name: "OnePlus 12 256GB",
    category: "Smartphones",
    brand: "OnePlus",
    type: "serialized",
    price: 899,
    cost: 699,
    stock: { main: 0, downtown: 1, warehouse: 3 },
    status: "low_stock",
  },
  {
    id: "22",
    sku: "NIN-SWITCH-O",
    name: "Nintendo Switch OLED",
    category: "Gaming",
    brand: "Nintendo",
    type: "serialized",
    price: 349,
    cost: 279,
    stock: { main: 6, downtown: 4, warehouse: 12 },
    status: "active",
  },
  {
    id: "23",
    sku: "IPAD-AIR-M2",
    name: "iPad Air M2 256GB",
    category: "Tablets",
    brand: "Apple",
    type: "serialized",
    price: 699,
    cost: 549,
    stock: { main: 8, downtown: 5, warehouse: 15 },
    status: "active",
  },
  {
    id: "24",
    sku: "BOSE-QC45",
    name: "Bose QuietComfort 45",
    category: "Audio",
    brand: "Bose",
    type: "serialized",
    price: 329,
    cost: 249,
    stock: { main: 7, downtown: 5, warehouse: 18 },
    status: "active",
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
