import { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  Truck,
  ArrowRight,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateTransferDialog } from "@/components/stock-transfers/CreateTransferDialog";
import { ViewTransferDialog } from "@/components/stock-transfers/ViewTransferDialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface Transfer {
  id: string;
  transferNumber: string;
  fromBranch: string;
  toBranch: string;
  status: "pending" | "in_transit" | "received" | "cancelled";
  itemCount: number;
  totalQty: number;
  createdAt: Date;
  receivedAt?: Date;
  notes?: string;
}

const transfers: Transfer[] = [
  {
    id: "1",
    transferNumber: "TRF-2024-0001",
    fromBranch: "Warehouse",
    toBranch: "Main Branch",
    status: "received",
    itemCount: 5,
    totalQty: 25,
    createdAt: new Date("2024-01-15"),
    receivedAt: new Date("2024-01-16"),
    notes: "Weekly restocking",
  },
  {
    id: "2",
    transferNumber: "TRF-2024-0002",
    fromBranch: "Main Branch",
    toBranch: "Downtown Store",
    status: "in_transit",
    itemCount: 3,
    totalQty: 10,
    createdAt: new Date("2024-01-18"),
    notes: "Urgent - customer request",
  },
  {
    id: "3",
    transferNumber: "TRF-2024-0003",
    fromBranch: "Warehouse",
    toBranch: "Downtown Store",
    status: "pending",
    itemCount: 8,
    totalQty: 50,
    createdAt: new Date("2024-01-20"),
    notes: "Monthly stock replenishment",
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  in_transit: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]",
  received: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_transit: "In Transit",
  received: "Received",
  cancelled: "Cancelled",
};

export default function StockTransfers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

  const handleViewDetails = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setViewDialogOpen(true);
  };

  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch =
      t.transferNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.fromBranch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.toBranch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = transfers.filter((t) => t.status === "pending").length;
  const inTransitCount = transfers.filter((t) => t.status === "in_transit").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Transfers</h1>
          <p className="text-muted-foreground">Transfer inventory between branches</p>
        </div>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{transfers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[hsl(var(--warning))]">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[hsl(var(--info))]">{inTransitCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[hsl(var(--success))]">
              {transfers.filter((t) => t.status === "received").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transfers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Transfers Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Transfer #</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-center">Total Qty</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransfers.map((transfer) => (
              <TableRow key={transfer.id} className="hover:bg-muted/30">
                <TableCell className="font-mono font-medium">{transfer.transferNumber}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{transfer.fromBranch}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{transfer.toBranch}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{transfer.itemCount}</TableCell>
                <TableCell className="text-center">{transfer.totalQty}</TableCell>
                <TableCell>{format(transfer.createdAt, "MMM dd, yyyy")}</TableCell>
                <TableCell>
                  {transfer.receivedAt ? format(transfer.receivedAt, "MMM dd, yyyy") : "-"}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[transfer.status]}>
                    {statusLabels[transfer.status]}
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
                      <DropdownMenuItem onClick={() => handleViewDetails(transfer)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {transfer.status === "pending" && (
                        <DropdownMenuItem>
                          <Truck className="mr-2 h-4 w-4" />
                          Mark In Transit
                        </DropdownMenuItem>
                      )}
                      {transfer.status === "in_transit" && (
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Received
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateTransferDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ViewTransferDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} transfer={selectedTransfer} />
    </div>
  );
}
