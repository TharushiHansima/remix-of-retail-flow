import { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateAdjustmentDialog } from "@/components/stock-adjustments/CreateAdjustmentDialog";
import { ViewAdjustmentDialog } from "@/components/stock-adjustments/ViewAdjustmentDialog";
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

interface Adjustment {
  id: string;
  adjustmentNumber: string;
  branch: string;
  type: "gain" | "loss" | "damage" | "theft" | "miscount";
  reason: string;
  status: "pending" | "approved" | "rejected";
  itemCount: number;
  totalChange: number;
  createdBy: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

const adjustments: Adjustment[] = [
  {
    id: "1",
    adjustmentNumber: "ADJ-2024-0001",
    branch: "Main Branch",
    type: "miscount",
    reason: "Physical count reconciliation - Q1 2024",
    status: "approved",
    itemCount: 12,
    totalChange: -8,
    createdBy: "John Doe",
    createdAt: new Date("2024-01-20"),
    approvedBy: "Sarah Manager",
    approvedAt: new Date("2024-01-21"),
  },
  {
    id: "2",
    adjustmentNumber: "ADJ-2024-0002",
    branch: "Downtown Store",
    type: "damage",
    reason: "Water damage from pipe leak - Insurance claim #45678",
    status: "approved",
    itemCount: 3,
    totalChange: -3,
    createdBy: "Mike Staff",
    createdAt: new Date("2024-01-22"),
    approvedBy: "Sarah Manager",
    approvedAt: new Date("2024-01-22"),
  },
  {
    id: "3",
    adjustmentNumber: "ADJ-2024-0003",
    branch: "Warehouse",
    type: "gain",
    reason: "Found unreported shipment from supplier",
    status: "pending",
    itemCount: 5,
    totalChange: 20,
    createdBy: "Jane Store",
    createdAt: new Date("2024-01-25"),
  },
  {
    id: "4",
    adjustmentNumber: "ADJ-2024-0004",
    branch: "Main Branch",
    type: "theft",
    reason: "Suspected internal theft - Incident report #789",
    status: "pending",
    itemCount: 2,
    totalChange: -5,
    createdBy: "John Doe",
    createdAt: new Date("2024-01-26"),
  },
  {
    id: "5",
    adjustmentNumber: "ADJ-2024-0005",
    branch: "Downtown Store",
    type: "loss",
    reason: "Items damaged during transit from warehouse",
    status: "approved",
    itemCount: 4,
    totalChange: -7,
    createdBy: "Lisa Chen",
    createdAt: new Date("2024-01-28"),
    approvedBy: "Sarah Manager",
    approvedAt: new Date("2024-01-29"),
  },
  {
    id: "6",
    adjustmentNumber: "ADJ-2024-0006",
    branch: "Warehouse",
    type: "miscount",
    reason: "Annual inventory audit adjustment",
    status: "pending",
    itemCount: 15,
    totalChange: -12,
    createdBy: "Robert Taylor",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "7",
    adjustmentNumber: "ADJ-2024-0007",
    branch: "Main Branch",
    type: "gain",
    reason: "Customer return - wrong item shipped, extra received",
    status: "approved",
    itemCount: 1,
    totalChange: 2,
    createdBy: "Amanda Wong",
    createdAt: new Date("2024-02-03"),
    approvedBy: "John Doe",
    approvedAt: new Date("2024-02-04"),
  },
  {
    id: "8",
    adjustmentNumber: "ADJ-2024-0008",
    branch: "Mall Outlet",
    type: "damage",
    reason: "Display units damaged - customer accident",
    status: "rejected",
    itemCount: 2,
    totalChange: -4,
    createdBy: "Kevin Park",
    createdAt: new Date("2024-02-05"),
    approvedBy: "Sarah Manager",
    approvedAt: new Date("2024-02-06"),
  },
  {
    id: "9",
    adjustmentNumber: "ADJ-2024-0009",
    branch: "Warehouse",
    type: "loss",
    reason: "Expired batch disposal - accessories",
    status: "approved",
    itemCount: 8,
    totalChange: -25,
    createdBy: "Emily Davis",
    createdAt: new Date("2024-02-08"),
    approvedBy: "Robert Taylor",
    approvedAt: new Date("2024-02-09"),
  },
  {
    id: "10",
    adjustmentNumber: "ADJ-2024-0010",
    branch: "Downtown Store",
    type: "miscount",
    reason: "Weekly stock reconciliation discrepancy",
    status: "pending",
    itemCount: 6,
    totalChange: 4,
    createdBy: "Mike Staff",
    createdAt: new Date("2024-02-10"),
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  approved: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  rejected: "bg-destructive/10 text-destructive",
};

const typeColors: Record<string, string> = {
  gain: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  loss: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  damage: "bg-destructive/10 text-destructive",
  theft: "bg-destructive/10 text-destructive",
  miscount: "bg-muted text-muted-foreground",
};

const typeIcons: Record<string, typeof TrendingUp> = {
  gain: TrendingUp,
  loss: TrendingDown,
  damage: AlertTriangle,
  theft: AlertTriangle,
  miscount: Package,
};

export default function StockAdjustments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<Adjustment | null>(null);

  const handleViewDetails = (adjustment: Adjustment) => {
    setSelectedAdjustment(adjustment);
    setViewDialogOpen(true);
  };

  const filteredAdjustments = adjustments.filter((adj) => {
    const matchesSearch =
      adj.adjustmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adj.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || adj.status === statusFilter;
    const matchesType = typeFilter === "all" || adj.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = adjustments.filter((a) => a.status === "pending").length;
  const totalGain = adjustments
    .filter((a) => a.status === "approved" && a.totalChange > 0)
    .reduce((sum, a) => sum + a.totalChange, 0);
  const totalLoss = adjustments
    .filter((a) => a.status === "approved" && a.totalChange < 0)
    .reduce((sum, a) => sum + Math.abs(a.totalChange), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Adjustments</h1>
          <p className="text-muted-foreground">Manage inventory adjustments with approval workflow</p>
        </div>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Adjustment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{adjustments.length}</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Gain</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[hsl(var(--success))]">+{totalGain}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">-{totalLoss}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search adjustments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="gain">Gain</SelectItem>
            <SelectItem value="loss">Loss</SelectItem>
            <SelectItem value="damage">Damage</SelectItem>
            <SelectItem value="theft">Theft</SelectItem>
            <SelectItem value="miscount">Miscount</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Adjustments Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Adjustment #</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-center">Change</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdjustments.map((adj) => {
              const TypeIcon = typeIcons[adj.type];
              return (
                <TableRow key={adj.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-medium">{adj.adjustmentNumber}</TableCell>
                  <TableCell>{adj.branch}</TableCell>
                  <TableCell>
                    <Badge className={`${typeColors[adj.type]} gap-1`}>
                      <TypeIcon className="h-3 w-3" />
                      {adj.type.charAt(0).toUpperCase() + adj.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{adj.reason}</TableCell>
                  <TableCell className="text-center">{adj.itemCount}</TableCell>
                  <TableCell className="text-center">
                    <span className={adj.totalChange > 0 ? "text-[hsl(var(--success))]" : "text-destructive"}>
                      {adj.totalChange > 0 ? "+" : ""}{adj.totalChange}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{format(adj.createdAt, "MMM dd, yyyy")}</p>
                      <p className="text-xs text-muted-foreground">{adj.createdBy}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[adj.status]}>
                      {adj.status.charAt(0).toUpperCase() + adj.status.slice(1)}
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
                        <DropdownMenuItem onClick={() => handleViewDetails(adj)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {adj.status === "pending" && (
                          <>
                            <DropdownMenuItem className="text-[hsl(var(--success))]">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <CreateAdjustmentDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ViewAdjustmentDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} adjustment={selectedAdjustment} />
    </div>
  );
}
