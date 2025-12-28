import { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  Send,
  Printer,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  customerEmail: string;
  date: Date;
  dueDate: Date;
  type: "sale" | "quotation" | "proforma" | "return";
  status: "draft" | "pending" | "paid" | "partial" | "cancelled";
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  items: {
    id: string;
    product: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }[];
}

const invoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-0001",
    customer: "John Smith",
    customerEmail: "john@example.com",
    date: new Date("2024-01-15"),
    dueDate: new Date("2024-01-30"),
    type: "sale",
    status: "paid",
    subtotal: 2398,
    discount: 100,
    tax: 229.8,
    total: 2527.8,
    paid: 2527.8,
    items: [
      { id: "1", product: "iPhone 15 Pro Max 256GB", sku: "APL-IP15PM-256", quantity: 2, unitPrice: 1199, discount: 50, total: 2348 },
    ],
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-0002",
    customer: "Sarah Johnson",
    customerEmail: "sarah@example.com",
    date: new Date("2024-01-16"),
    dueDate: new Date("2024-01-31"),
    type: "sale",
    status: "pending",
    subtotal: 1099,
    discount: 0,
    tax: 109.9,
    total: 1208.9,
    paid: 0,
    items: [
      { id: "1", product: "Samsung Galaxy S24 Ultra", sku: "SAM-S24U-256", quantity: 1, unitPrice: 1099, discount: 0, total: 1099 },
    ],
  },
  {
    id: "3",
    invoiceNumber: "QT-2024-0001",
    customer: "Tech Corp Ltd",
    customerEmail: "purchasing@techcorp.com",
    date: new Date("2024-01-17"),
    dueDate: new Date("2024-02-17"),
    type: "quotation",
    status: "draft",
    subtotal: 9995,
    discount: 500,
    tax: 949.5,
    total: 10444.5,
    paid: 0,
    items: [
      { id: "1", product: "MacBook Pro 14\" M3", sku: "APL-MBP14-M3", quantity: 5, unitPrice: 1999, discount: 100, total: 9495 },
    ],
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-0003",
    customer: "Mike Wilson",
    customerEmail: "mike@example.com",
    date: new Date("2024-01-18"),
    dueDate: new Date("2024-02-02"),
    type: "sale",
    status: "partial",
    subtotal: 498,
    discount: 0,
    tax: 49.8,
    total: 547.8,
    paid: 300,
    items: [
      { id: "1", product: "AirPods Pro 2nd Gen", sku: "APL-APP2", quantity: 2, unitPrice: 249, discount: 0, total: 498 },
    ],
  },
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  paid: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  partial: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]",
  cancelled: "bg-destructive/10 text-destructive",
};

const typeLabels: Record<string, string> = {
  sale: "Sale",
  quotation: "Quotation",
  proforma: "Proforma",
  return: "Return",
};

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchesType = typeFilter === "all" || inv.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);

  const pendingAmount = invoices
    .filter((i) => i.status === "pending" || i.status === "partial")
    .reduce((sum, i) => sum + (i.total - i.paid), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Invoices</h1>
          <p className="text-muted-foreground">Manage invoices, quotations, and billing</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[hsl(var(--success))]">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[hsl(var(--warning))]">${pendingAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{invoices.filter((i) => i.type === "quotation").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sale">Sales</SelectItem>
            <SelectItem value="quotation">Quotations</SelectItem>
            <SelectItem value="proforma">Proforma</SelectItem>
            <SelectItem value="return">Returns</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Invoices Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id} className="hover:bg-muted/30">
                <TableCell className="font-mono font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{invoice.customer}</p>
                    <p className="text-xs text-muted-foreground">{invoice.customerEmail}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{typeLabels[invoice.type]}</Badge>
                </TableCell>
                <TableCell>{format(invoice.date, "MMM dd, yyyy")}</TableCell>
                <TableCell className="text-right font-medium">${invoice.total.toFixed(2)}</TableCell>
                <TableCell className="text-right">${invoice.paid.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={statusColors[invoice.status]}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DialogTrigger asChild onClick={() => setSelectedInvoice(invoice)}>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Invoice {selectedInvoice?.invoiceNumber}
                        </DialogTitle>
                      </DialogHeader>
                      {selectedInvoice && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Customer</p>
                              <p className="font-medium">{selectedInvoice.customer}</p>
                              <p className="text-sm text-muted-foreground">{selectedInvoice.customerEmail}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={statusColors[selectedInvoice.status]}>
                                {selectedInvoice.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Invoice Date</p>
                              <p className="font-medium">{format(selectedInvoice.date, "MMM dd, yyyy")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Due Date</p>
                              <p className="font-medium">{format(selectedInvoice.dueDate, "MMM dd, yyyy")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Type</p>
                              <p className="font-medium">{typeLabels[selectedInvoice.type]}</p>
                            </div>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Discount</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedInvoice.items.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">{item.product}</TableCell>
                                  <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                                  <TableCell className="text-center">{item.quantity}</TableCell>
                                  <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                                  <TableCell className="text-right">${item.discount.toFixed(2)}</TableCell>
                                  <TableCell className="text-right font-medium">${item.total.toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                <span>-${selectedInvoice.discount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span>${selectedInvoice.tax.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-medium pt-2 border-t">
                                <span>Total</span>
                                <span>${selectedInvoice.total.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm text-[hsl(var(--success))]">
                                <span>Paid</span>
                                <span>${selectedInvoice.paid.toFixed(2)}</span>
                              </div>
                              {selectedInvoice.total - selectedInvoice.paid > 0 && (
                                <div className="flex justify-between text-sm text-[hsl(var(--warning))]">
                                  <span>Balance Due</span>
                                  <span>${(selectedInvoice.total - selectedInvoice.paid).toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
