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

  const filteredOrders = orders.filter(
    (o) =>
      o.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <CreatePurchaseOrderDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Order
                        </DropdownMenuItem>
                        <DropdownMenuItem>
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
