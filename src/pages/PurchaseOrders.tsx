import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  Package,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatePurchaseOrderDialog } from "@/components/purchase-orders/CreatePurchaseOrderDialog";
import { ViewPurchaseOrderDialog } from "@/components/purchase-orders/ViewPurchaseOrderDialog";
import { EditPurchaseOrderDialog } from "@/components/purchase-orders/EditPurchaseOrderDialog";
import { CreateGRNDialog } from "@/components/purchase-orders/CreateGRNDialog";
import { toast } from "sonner";

import { listPurchaseOrders } from "@/features/procurement/purchase-orders/purchase-orders.api";
import type {
  PurchaseOrder as ApiPO,
  PurchaseOrderStatus as ApiPOStatus,
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
  lineItems?: ApiPO["items"];
}

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  pending: { label: "Pending", color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]", icon: Clock },
  approved: { label: "Approved", color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]", icon: CheckCircle2 },
  shipped: { label: "Shipped", color: "bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]", icon: Truck },
  received: { label: "Received", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", icon: Package },
  partial: { label: "Partial", color: "bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]", icon: Package },
};

function toNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function formatDate(d?: string | null) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  // keep same style as your dummy (yyyy-mm-dd)
  return dt.toISOString().slice(0, 10);
}

function mapBackendStatusToUi(s: ApiPOStatus): PurchaseOrder["status"] {
  switch (s) {
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
    // backend has cancelled - UI has no "cancelled"
    case "cancelled":
    default:
      return "draft";
  }
}

// Tabs -> backend status filter
function mapTabToBackendStatus(tab: string): ApiPOStatus | undefined {
  switch (tab) {
    case "pending":
      return "pending_approval";
    case "shipped":
      // your backend doesn’t have "shipped"; best match is "approved"
      return "approved";
    case "received":
      return "received";
    default:
      return undefined; // all
  }
}

function normalizeFindAll(res: any): { data: ApiPO[]; total: number } {
  if (res?.data && Array.isArray(res.data)) {
    return { data: res.data, total: Number(res?.meta?.total ?? res.data.length) };
  }
  if (Array.isArray(res)) return { data: res, total: res.length };
  return { data: [], total: 0 };
}

export default function PurchaseOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState("all");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGRNDialogOpen, setIsGRNDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handler = () => setRefreshKey((key) => key + 1);
    window.addEventListener("purchase-orders:changed", handler);
    window.addEventListener("grns:changed", handler);
    return () => {
      window.removeEventListener("purchase-orders:changed", handler);
      window.removeEventListener("grns:changed", handler);
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const t = setTimeout(() => {
      void (async () => {
        try {
          setLoading(true);

          const status = mapTabToBackendStatus(tab);

          const res = await listPurchaseOrders({
            q: searchQuery.trim() ? searchQuery.trim() : undefined,
            status,
            page: 1,
            pageSize: 50,
          });

          const { data } = normalizeFindAll(res);

          const mapped: PurchaseOrder[] = data.map((po) => {
            const qtySum = (po.items ?? []).reduce((sum, it) => sum + toNumber(it.quantity), 0);

            return {
              id: po.id,
              poNumber: po.poNumber,
              supplier: po.supplier?.name ?? "-",
              supplierId: po.supplierId,
              branchId: po.branchId,
              orderDate: formatDate(po.createdAt),
              expectedDate: formatDate(po.expectedDate),
              items: qtySum,
              totalValue: toNumber(po.totalAmount),
              status: mapBackendStatusToUi(po.status),
              lineItems: po.items ?? [],
            };
          });

          if (!alive) return;
          setOrders(mapped);
        } catch (e: any) {
          if (!alive) return;
          toast.error(e?.message || "Failed to load purchase orders");
          setOrders([]);
        } finally {
          if (alive) setLoading(false);
        }
      })();
    }, 250);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [searchQuery, tab, refreshKey]);

  // Keep your UI search filtering behavior too (optional extra safety)
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        (o.poNumber || "").toLowerCase().includes(q) ||
        (o.supplier || "").toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const handleViewDetails = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleCreateGRN = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsGRNDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage supplier orders and procurement</p>
        </div>
        <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Purchase Order
        </Button>
      </div>

      {/* Dialogs */}
      <CreatePurchaseOrderDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      <ViewPurchaseOrderDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        order={selectedOrder}
      />
      <EditPurchaseOrderDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        order={selectedOrder}
      />
      <CreateGRNDialog
        open={isGRNDialogOpen}
        onOpenChange={setIsGRNDialogOpen}
        order={selectedOrder}
      />

      {/* Status Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="shipped">In Transit</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Tabs>

      {/* Orders Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>PO Number</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Expected Delivery</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48">
                  <EmptyState
                    variant={searchQuery ? "no-results" : "no-data"}
                    title={searchQuery ? "No orders match your search" : "No purchase orders yet"}
                    description={searchQuery ? "Try different search terms" : "Get started by creating your first purchase order"}
                    action={!searchQuery ? { label: "New Purchase Order", onClick: () => setIsCreateDialogOpen(true) } : undefined}
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const statusMeta = statusConfig[order.status] ?? statusConfig.draft;
                const StatusIcon = statusMeta.icon;
                return (
                  <TableRow key={order.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-medium">{order.poNumber}</TableCell>
                    <TableCell>{order.supplier}</TableCell>
                    <TableCell className="text-muted-foreground">{order.orderDate}</TableCell>
                    <TableCell className="text-muted-foreground">{order.expectedDate}</TableCell>
                    <TableCell className="text-center">{order.items}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${order.totalValue.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={`gap-1 ${statusMeta.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusMeta.label}
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
                          <DropdownMenuItem onSelect={() => handleViewDetails(order)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleEditOrder(order)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleCreateGRN(order)}>
                            <Package className="mr-2 h-4 w-4" />
                            Create GRN
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
