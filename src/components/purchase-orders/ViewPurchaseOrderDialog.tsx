import { useEffect, useMemo, useState } from "react";
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
import { FileText, Truck, CheckCircle2, Clock, Package } from "lucide-react";
import { getPurchaseOrder } from "@/features/procurement/purchase-orders/purchase-orders.api";
import type {
  PurchaseOrder as ApiPurchaseOrder,
  PurchaseOrderStatus,
} from "@/features/procurement/purchase-orders/purchase-orders.types";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  supplierId?: string;
  branchId?: string;
  orderDate: string;
  expectedDate: string;
  items: number;
  totalValue: number;
  status: "draft" | "pending" | "approved" | "shipped" | "received" | "partial";
  lineItems?: ApiPurchaseOrder["items"];
}

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  pending: { label: "Pending", color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]", icon: Clock },
  approved: { label: "Approved", color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]", icon: CheckCircle2 },
  shipped: { label: "Shipped", color: "bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]", icon: Truck },
  received: { label: "Received", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", icon: Package },
  partial: { label: "Partial", color: "bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]", icon: Package },
};

type ApiPurchaseOrderDetail = ApiPurchaseOrder;

function toNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toISOString().slice(0, 10);
}

function mapBackendStatusToUi(status?: PurchaseOrderStatus): PurchaseOrder["status"] {
  switch (status) {
    case "draft":
      return "draft";
    case "pending_approval":
      return "pending";
    case "approved":
      return "approved";
    case "partially_received":
      return "partial";
    case "received":
      return "received";
    case "cancelled":
    default:
      return "draft";
  }
}

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
  const [detail, setDetail] = useState<ApiPurchaseOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setDetail(null);
    if (!open || !order?.id) return;
    if (order?.lineItems && order.lineItems.length > 0) return;

    void (async () => {
      try {
        setLoading(true);
        const res = await getPurchaseOrder(order.id);
        if (!alive) return;
        setDetail(res ?? null);
      } catch {
        if (!alive) return;
        setDetail(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, order?.id]);

  const safeOrder: PurchaseOrder = order ?? {
    id: "",
    poNumber: "",
    supplier: "",
    orderDate: "",
    expectedDate: "",
    items: 0,
    totalValue: 0,
    status: "draft",
  };

  const statusKey = detail?.status ? mapBackendStatusToUi(detail.status) : safeOrder.status;
  const statusMeta = statusConfig[statusKey] ?? statusConfig.draft;
  const StatusIcon = statusMeta.icon;

  const lineItems = detail?.items ?? safeOrder.lineItems ?? [];
  const computedTotal = useMemo(() => {
    return lineItems.reduce(
      (sum, it) => sum + toNumber(it.unitCost) * Number(it.quantity ?? 0),
      0
    );
  }, [lineItems]);

  const subtotal = computedTotal || safeOrder.totalValue;

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{safeOrder.poNumber}</DialogTitle>
            <Badge className={`gap-1 ${statusMeta.color}`}>
              <StatusIcon className="h-3 w-3" />
              {statusMeta.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p className="font-medium">
                {detail?.supplier?.name || safeOrder.supplier}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">
                {detail?.createdAt ? formatDate(detail.createdAt) : safeOrder.orderDate}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Expected Delivery</p>
              <p className="font-medium">
                {detail?.expectedDate ? formatDate(detail.expectedDate) : safeOrder.expectedDate}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="font-medium">
                {lineItems.length > 0
                  ? lineItems.reduce((sum, it) => sum + Number(it.quantity ?? 0), 0)
                  : safeOrder.items}
              </p>
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5}>Loading...</TableCell>
                    </TableRow>
                  ) : lineItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>No items</TableCell>
                    </TableRow>
                  ) : (
                    lineItems.map((it) => {
                      const qty = Number(it.quantity ?? 0);
                      const unit = toNumber(it.unitCost);
                      const productName =
                        it.product?.name ?? (it as { productName?: string }).productName ?? "Unknown product";
                      const sku = it.product?.sku ?? (it as { sku?: string }).sku ?? "-";
                      return (
                        <TableRow key={it.id}>
                          <TableCell className="font-medium">
                            {productName}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {sku}
                          </TableCell>
                          <TableCell className="text-center">{qty}</TableCell>
                          <TableCell className="text-right">
                            ${unit.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${(qty * unit).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
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
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (0%)</span>
                <span>$0</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span className="text-lg">${subtotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
