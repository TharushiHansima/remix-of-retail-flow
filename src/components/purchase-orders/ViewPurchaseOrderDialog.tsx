import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  Package,
} from "lucide-react";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  items: number;
  totalValue: number;
  status: "draft" | "pending" | "approved" | "shipped" | "received" | "partial";
}

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  pending: { label: "Pending", color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]", icon: Clock },
  approved: { label: "Approved", color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]", icon: CheckCircle2 },
  shipped: { label: "Shipped", color: "bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]", icon: Truck },
  received: { label: "Received", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", icon: Package },
  partial: { label: "Partial", color: "bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]", icon: Package },
};

// Mock line items for display
const mockLineItems = [
  { id: "1", product: "iPhone 15 Pro 256GB", sku: "IP15P-256", quantity: 10, unitCost: 999, received: 0 },
  { id: "2", product: "USB-C Cable 2m", sku: "ACC-USBC-2M", quantity: 50, unitCost: 15, received: 0 },
  { id: "3", product: "Phone Case Clear", sku: "ACC-CASE-CLR", quantity: 100, unitCost: 12, received: 0 },
];

interface ViewPurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PurchaseOrder | null;
}

export function ViewPurchaseOrderDialog({
  open,
  onOpenChange,
  order,
}: ViewPurchaseOrderDialogProps) {
  if (!order) return null;

  const StatusIcon = statusConfig[order.status].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{order.poNumber}</DialogTitle>
            <Badge className={`gap-1 ${statusConfig[order.status].color}`}>
              <StatusIcon className="h-3 w-3" />
              {statusConfig[order.status].label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p className="font-medium">{order.supplier}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">{order.orderDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Expected Delivery</p>
              <p className="font-medium">{order.expectedDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="font-medium">{order.items}</p>
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div className="space-y-3">
            <h3 className="font-medium">Order Items</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {item.sku}
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        ${item.unitCost.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${(item.quantity * item.unitCost).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.totalValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (0%)</span>
                <span>$0</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span className="text-lg">${order.totalValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
