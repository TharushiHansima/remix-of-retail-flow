import { useState } from "react";
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

const orders: PurchaseOrder[] = [
  {
    id: "1",
    poNumber: "PO-2024-0125",
    supplier: "Apple Inc.",
    orderDate: "2024-01-25",
    expectedDate: "2024-02-05",
    items: 15,
    totalValue: 125000,
    status: "shipped",
  },
  {
    id: "2",
    poNumber: "PO-2024-0124",
    supplier: "Samsung Electronics",
    orderDate: "2024-01-24",
    expectedDate: "2024-02-01",
    items: 25,
    totalValue: 85000,
    status: "approved",
  },
  {
    id: "3",
    poNumber: "PO-2024-0123",
    supplier: "Generic Accessories Ltd",
    orderDate: "2024-01-22",
    expectedDate: "2024-01-28",
    items: 100,
    totalValue: 12500,
    status: "received",
  },
  {
    id: "4",
    poNumber: "PO-2024-0122",
    supplier: "Tech Distributors Inc",
    orderDate: "2024-01-20",
    expectedDate: "2024-01-30",
    items: 8,
    totalValue: 45000,
    status: "partial",
  },
  {
    id: "5",
    poNumber: "PO-2024-0126",
    supplier: "Mobile Accessories Co",
    orderDate: "2024-01-26",
    expectedDate: "2024-02-10",
    items: 50,
    totalValue: 8500,
    status: "pending",
  },
  {
    id: "6",
    poNumber: "PO-2024-0127",
    supplier: "Sony Corporation",
    orderDate: "2024-01-27",
    expectedDate: "2024-02-12",
    items: 20,
    totalValue: 62000,
    status: "draft",
  },
  {
    id: "7",
    poNumber: "PO-2024-0128",
    supplier: "Dell Technologies",
    orderDate: "2024-01-28",
    expectedDate: "2024-02-15",
    items: 12,
    totalValue: 78500,
    status: "pending",
  },
  {
    id: "8",
    poNumber: "PO-2024-0129",
    supplier: "Logitech International",
    orderDate: "2024-01-29",
    expectedDate: "2024-02-08",
    items: 45,
    totalValue: 15600,
    status: "approved",
  },
  {
    id: "9",
    poNumber: "PO-2024-0130",
    supplier: "Anker Innovations",
    orderDate: "2024-01-30",
    expectedDate: "2024-02-12",
    items: 80,
    totalValue: 9200,
    status: "shipped",
  },
  {
    id: "10",
    poNumber: "PO-2024-0131",
    supplier: "Google Hardware",
    orderDate: "2024-01-31",
    expectedDate: "2024-02-18",
    items: 18,
    totalValue: 54000,
    status: "pending",
  },
  {
    id: "11",
    poNumber: "PO-2024-0132",
    supplier: "Lenovo Group",
    orderDate: "2024-02-01",
    expectedDate: "2024-02-20",
    items: 10,
    totalValue: 48000,
    status: "approved",
  },
  {
    id: "12",
    poNumber: "PO-2024-0133",
    supplier: "TP-Link Technologies",
    orderDate: "2024-02-02",
    expectedDate: "2024-02-16",
    items: 35,
    totalValue: 12800,
    status: "received",
  },
  {
    id: "13",
    poNumber: "PO-2024-0134",
    supplier: "Bose Corporation",
    orderDate: "2024-02-03",
    expectedDate: "2024-02-22",
    items: 15,
    totalValue: 28500,
    status: "partial",
  },
  {
    id: "14",
    poNumber: "PO-2024-0135",
    supplier: "OnePlus Technology",
    orderDate: "2024-02-04",
    expectedDate: "2024-02-25",
    items: 22,
    totalValue: 66000,
    status: "draft",
  },
  {
    id: "15",
    poNumber: "PO-2024-0136",
    supplier: "Nintendo Co.",
    orderDate: "2024-02-05",
    expectedDate: "2024-02-28",
    items: 30,
    totalValue: 42000,
    status: "pending",
  },
];

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  pending: { label: "Pending", color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]", icon: Clock },
  approved: { label: "Approved", color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]", icon: CheckCircle2 },
  shipped: { label: "Shipped", color: "bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]", icon: Truck },
  received: { label: "Received", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", icon: Package },
  partial: { label: "Partial", color: "bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]", icon: Package },
};

export default function PurchaseOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGRNDialogOpen, setIsGRNDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  const filteredOrders = orders.filter(
    (o) =>
      o.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <Tabs defaultValue="all">
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
            {filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
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
                    <Badge className={`gap-1 ${statusConfig[order.status].color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[order.status].label}
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
                        <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCreateGRN(order)}>
                          <Package className="mr-2 h-4 w-4" />
                          Create GRN
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
