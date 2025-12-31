import { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Printer,
  CreditCard,
  User,
  Smartphone,
  FileText,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ServiceBill {
  id: string;
  billNumber: string;
  jobCardNumber: string;
  customer: string;
  phone: string;
  device: string;
  status: "draft" | "pending" | "paid" | "partial" | "overdue";
  laborCost: number;
  partsCost: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  createdAt: string;
}

const serviceBills: ServiceBill[] = [
  {
    id: "1",
    billNumber: "SB-2024-0089",
    jobCardNumber: "JC-2024-0088",
    customer: "David Lee",
    phone: "+1 234 567 8905",
    device: "iPhone 14 Pro",
    status: "paid",
    laborCost: 50,
    partsCost: 89,
    discount: 0,
    tax: 13.9,
    totalAmount: 152.9,
    paidAmount: 152.9,
    dueDate: "2024-01-28",
    createdAt: "2024-01-28",
  },
  {
    id: "2",
    billNumber: "SB-2024-0090",
    jobCardNumber: "JC-2024-0089",
    customer: "Emily Wilson",
    phone: "+1 234 567 8904",
    device: "iPad Pro 12.9\"",
    status: "pending",
    laborCost: 75,
    partsCost: 120,
    discount: 10,
    tax: 18.5,
    totalAmount: 203.5,
    paidAmount: 0,
    dueDate: "2024-02-05",
    createdAt: "2024-01-29",
  },
  {
    id: "3",
    billNumber: "SB-2024-0091",
    jobCardNumber: "JC-2024-0090",
    customer: "Michael Brown",
    phone: "+1 234 567 8903",
    device: "Samsung Galaxy S24 Ultra",
    status: "partial",
    laborCost: 75,
    partsCost: 280,
    discount: 0,
    tax: 35.5,
    totalAmount: 390.5,
    paidAmount: 200,
    dueDate: "2024-02-01",
    createdAt: "2024-01-28",
  },
  {
    id: "4",
    billNumber: "SB-2024-0087",
    jobCardNumber: "JC-2024-0085",
    customer: "Robert Taylor",
    phone: "+1 234 567 8907",
    device: "MacBook Pro 16\"",
    status: "overdue",
    laborCost: 150,
    partsCost: 450,
    discount: 25,
    tax: 57.5,
    totalAmount: 632.5,
    paidAmount: 0,
    dueDate: "2024-01-20",
    createdAt: "2024-01-10",
  },
  {
    id: "5",
    billNumber: "SB-2024-0092",
    jobCardNumber: "JC-2024-0092",
    customer: "John Smith",
    phone: "+1 234 567 8901",
    device: "MacBook Pro 14\" M3",
    status: "draft",
    laborCost: 100,
    partsCost: 350,
    discount: 0,
    tax: 45,
    totalAmount: 495,
    paidAmount: 0,
    dueDate: "2024-02-10",
    createdAt: "2024-01-30",
  },
];

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  pending: { label: "Pending", color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]", icon: Clock },
  paid: { label: "Paid", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", icon: CheckCircle2 },
  partial: { label: "Partial", color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]", icon: DollarSign },
  overdue: { label: "Overdue", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

export default function ServiceBilling() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBills = serviceBills.filter(
    (bill) =>
      (statusFilter === "all" || bill.status === statusFilter) &&
      (bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.jobCardNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusCount = (status: string) =>
    serviceBills.filter((b) => b.status === status).length;

  const totalPending = serviceBills
    .filter((b) => b.status === "pending" || b.status === "partial" || b.status === "overdue")
    .reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);

  const totalCollected = serviceBills.reduce((sum, b) => sum + b.paidAmount, 0);

  const overdueAmount = serviceBills
    .filter((b) => b.status === "overdue")
    .reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Billing</h1>
          <p className="text-muted-foreground">Manage billing for repair and service jobs</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Bill
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalCollected.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-[hsl(var(--warning))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${overdueAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted">
            <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
              All ({serviceBills.length})
            </TabsTrigger>
            <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>
              Pending ({getStatusCount("pending")})
            </TabsTrigger>
            <TabsTrigger value="partial" onClick={() => setStatusFilter("partial")}>
              Partial ({getStatusCount("partial")})
            </TabsTrigger>
            <TabsTrigger value="paid" onClick={() => setStatusFilter("paid")}>
              Paid ({getStatusCount("paid")})
            </TabsTrigger>
            <TabsTrigger value="overdue" onClick={() => setStatusFilter("overdue")}>
              Overdue ({getStatusCount("overdue")})
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bills..."
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

        {/* Bills Table */}
        <TabsContent value="all" className="mt-0">
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Job Card</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => {
                  const StatusIcon = statusConfig[bill.status].icon;
                  const balance = bill.totalAmount - bill.paidAmount;
                  return (
                    <TableRow key={bill.id}>
                      <TableCell>
                        <span className="font-medium text-foreground">{bill.billNumber}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{bill.jobCardNumber}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{bill.customer}</p>
                            <p className="text-xs text-muted-foreground">{bill.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{bill.device}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-medium text-foreground">${bill.totalAmount.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-[hsl(var(--success))]">${bill.paidAmount.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn("text-sm font-medium", balance > 0 ? "text-destructive" : "text-foreground")}>
                          ${balance.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1", statusConfig[bill.status].color)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[bill.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-sm",
                          bill.status === "overdue" ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {bill.dueDate}
                        </span>
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
                            {bill.status !== "paid" && (
                              <DropdownMenuItem>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Record Payment
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              Print Bill
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
