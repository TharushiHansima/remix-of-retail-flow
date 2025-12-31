import { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  User,
  Smartphone,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Estimate {
  id: string;
  estimateNumber: string;
  customer: string;
  phone: string;
  device: string;
  issue: string;
  status: "draft" | "sent" | "approved" | "rejected" | "expired";
  laborCost: number;
  partsCost: number;
  totalCost: number;
  validUntil: string;
  createdAt: string;
  jobCardId?: string;
}

const estimates: Estimate[] = [
  {
    id: "1",
    estimateNumber: "EST-2024-0045",
    customer: "John Smith",
    phone: "+1 234 567 8901",
    device: "MacBook Pro 14\" M3",
    issue: "Screen replacement and keyboard repair",
    status: "sent",
    laborCost: 150,
    partsCost: 450,
    totalCost: 600,
    validUntil: "2024-02-05",
    createdAt: "2024-01-28",
  },
  {
    id: "2",
    estimateNumber: "EST-2024-0044",
    customer: "Sarah Davis",
    phone: "+1 234 567 8902",
    device: "iPhone 15 Pro Max",
    issue: "Battery replacement",
    status: "approved",
    laborCost: 50,
    partsCost: 89,
    totalCost: 139,
    validUntil: "2024-02-01",
    createdAt: "2024-01-25",
    jobCardId: "JC-2024-0091",
  },
  {
    id: "3",
    estimateNumber: "EST-2024-0043",
    customer: "Michael Brown",
    phone: "+1 234 567 8903",
    device: "Samsung Galaxy S24 Ultra",
    issue: "Cracked screen replacement",
    status: "approved",
    laborCost: 75,
    partsCost: 280,
    totalCost: 355,
    validUntil: "2024-01-30",
    createdAt: "2024-01-23",
    jobCardId: "JC-2024-0090",
  },
  {
    id: "4",
    estimateNumber: "EST-2024-0042",
    customer: "Emily Wilson",
    phone: "+1 234 567 8904",
    device: "iPad Pro 12.9\"",
    issue: "Charging port and battery replacement",
    status: "rejected",
    laborCost: 100,
    partsCost: 220,
    totalCost: 320,
    validUntil: "2024-01-28",
    createdAt: "2024-01-20",
  },
  {
    id: "5",
    estimateNumber: "EST-2024-0041",
    customer: "David Lee",
    phone: "+1 234 567 8905",
    device: "Dell XPS 15",
    issue: "Motherboard repair",
    status: "expired",
    laborCost: 200,
    partsCost: 350,
    totalCost: 550,
    validUntil: "2024-01-15",
    createdAt: "2024-01-08",
  },
  {
    id: "6",
    estimateNumber: "EST-2024-0046",
    customer: "Lisa Anderson",
    phone: "+1 234 567 8906",
    device: "MacBook Air M2",
    issue: "Keyboard replacement",
    status: "draft",
    laborCost: 80,
    partsCost: 180,
    totalCost: 260,
    validUntil: "2024-02-10",
    createdAt: "2024-01-29",
  },
];

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  sent: { label: "Sent", color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]", icon: Send },
  approved: { label: "Approved", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: XCircle },
  expired: { label: "Expired", color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]", icon: Clock },
};

export default function Estimates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredEstimates = estimates.filter(
    (estimate) =>
      (statusFilter === "all" || estimate.status === statusFilter) &&
      (estimate.estimateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        estimate.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        estimate.device.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusCount = (status: string) =>
    estimates.filter((e) => e.status === status).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estimates</h1>
          <p className="text-muted-foreground">Create and manage repair estimates for customers</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Estimate
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted">
            <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
              All ({estimates.length})
            </TabsTrigger>
            <TabsTrigger value="draft" onClick={() => setStatusFilter("draft")}>
              Draft ({getStatusCount("draft")})
            </TabsTrigger>
            <TabsTrigger value="sent" onClick={() => setStatusFilter("sent")}>
              Sent ({getStatusCount("sent")})
            </TabsTrigger>
            <TabsTrigger value="approved" onClick={() => setStatusFilter("approved")}>
              Approved ({getStatusCount("approved")})
            </TabsTrigger>
            <TabsTrigger value="rejected" onClick={() => setStatusFilter("rejected")}>
              Rejected ({getStatusCount("rejected")})
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search estimates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Estimates Table */}
        <TabsContent value="all" className="mt-0">
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead className="text-right">Parts</TableHead>
                  <TableHead className="text-right">Labor</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstimates.map((estimate) => {
                  const StatusIcon = statusConfig[estimate.status].icon;
                  return (
                    <TableRow key={estimate.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium text-foreground">{estimate.estimateNumber}</span>
                          {estimate.jobCardId && (
                            <p className="text-xs text-muted-foreground">→ {estimate.jobCardId}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{estimate.customer}</p>
                            <p className="text-xs text-muted-foreground">{estimate.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{estimate.device}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                          {estimate.issue}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-foreground">${estimate.partsCost.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-foreground">${estimate.laborCost.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-medium text-foreground">${estimate.totalCost.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1", statusConfig[estimate.status].color)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[estimate.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{estimate.validUntil}</span>
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
                              Edit
                            </DropdownMenuItem>
                            {estimate.status === "draft" && (
                              <DropdownMenuItem>
                                <Send className="mr-2 h-4 w-4" />
                                Send to Customer
                              </DropdownMenuItem>
                            )}
                            {estimate.status === "approved" && !estimate.jobCardId && (
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                Create Job Card
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
