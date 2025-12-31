import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package } from "lucide-react";

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

interface ViewProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
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

export function ViewProductDialog({ open, onOpenChange, product }: ViewProductDialogProps) {
  if (!product) return null;

  const totalStock = product.stock.main + product.stock.downtown + product.stock.warehouse;
  const margin = ((product.price - product.cost) / product.price) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Product Header */}
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">{product.sku}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{typeLabels[product.type]}</Badge>
                <Badge className={statusColors[product.status]}>
                  {product.status === "low_stock" ? "Low Stock" : product.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Category & Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{product.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Brand</p>
              <p className="font-medium">{product.brand}</p>
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Pricing
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Unit Price</p>
                <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Cost Price</p>
                <p className="text-lg font-semibold">${product.cost.toFixed(2)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Margin</p>
                <p className="text-lg font-semibold text-[hsl(var(--success))]">
                  {margin.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stock Levels */}
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Stock Levels
            </h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Main</p>
                <p className="text-lg font-semibold">{product.stock.main}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Downtown</p>
                <p className="text-lg font-semibold">{product.stock.downtown}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Warehouse</p>
                <p className="text-lg font-semibold">{product.stock.warehouse}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-semibold text-primary">{totalStock}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
