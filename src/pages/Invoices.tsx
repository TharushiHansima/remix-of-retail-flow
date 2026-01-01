import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  Send,
  Printer,
  CreditCard,
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
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useConfig } from "@/contexts/ConfigContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { mockInvoices, mockCustomers, mockInvoiceItems, mockProducts, type Invoice } from "@/data/mockData";

interface InvoiceWithDetails extends Invoice {
  customers?: { name: string; email: string | null } | null;
  invoice_items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    discount_percent: number | null;
    tax_percent: number | null;
    total: number;
    products?: { name: string; sku: string } | null;
  }>;
}

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

// Build invoices with related data
const getInvoicesWithDetails = (): InvoiceWithDetails[] => {
  return mockInvoices.map(invoice => {
    const customer = mockCustomers.find(c => c.id === invoice.customer_id);
    const items = mockInvoiceItems
      .filter(item => item.invoice_id === invoice.id)
      .map(item => {
        const product = mockProducts.find(p => p.id === item.product_id);
        return {
          ...item,
          discount_percent: item.discount_percent ?? 0,
          tax_percent: item.tax_percent ?? 0,
          products: product ? { name: product.name, sku: product.sku } : null,
        };
      });
    return {
      ...invoice,
      customers: customer ? { name: customer.name, email: customer.email } : null,
      invoice_items: items,
    };
  });
};

export default function Invoices() {
  const { formatCurrency } = useConfig();
  const [invoices] = useState<InvoiceWithDetails[]>(getInvoicesWithDetails());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customers?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchesType = typeFilter === "all" || inv.invoice_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total_amount, 0);

  const pendingAmount = invoices
    .filter((i) => i.status === "pending" || i.status === "partial")
    .reduce((sum, i) => sum + (i.total_amount - i.paid_amount), 0);

  const handleNewInvoice = () => {
    toast.info("New Invoice form - coming soon with database integration");
  };

  const openPaymentModal = (invoice: InvoiceWithDetails) => {
    toast.info("Record Payment - coming soon with database integration");
  };

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
          <Button size="sm" onClick={handleNewInvoice}>
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
            <p className="text-2xl font-bold text-[hsl(var(--success))]">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[hsl(var(--warning))]">{formatCurrency(pendingAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{invoices.filter((i) => i.invoice_type === "quotation").length}</p>
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
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {invoices.length === 0 ? "No invoices yet. Create your first invoice!" : "No invoices match your filters"}
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{invoice.customers?.name || "Walk-in"}</p>
                      {invoice.customers?.email && (
                        <p className="text-xs text-muted-foreground">{invoice.customers.email}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[invoice.invoice_type] || invoice.invoice_type}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(invoice.created_at), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(invoice.total_amount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.paid_amount)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[invoice.status] || statusColors.draft}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
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
                        <DropdownMenuItem onClick={() => {
                          setSelectedInvoice(invoice);
                          setViewDialogOpen(true);
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </DropdownMenuItem>
                        {invoice.status !== "paid" && invoice.status !== "cancelled" && invoice.invoice_type !== "quotation" && (
                          <DropdownMenuItem onClick={() => openPaymentModal(invoice)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Record Payment
                          </DropdownMenuItem>
                        )}
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Invoice Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice {selectedInvoice?.invoice_number}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedInvoice.customers?.name || "Walk-in"}</p>
                  {selectedInvoice.customers?.email && (
                    <p className="text-sm text-muted-foreground">{selectedInvoice.customers.email}</p>
                  )}
                </div>
                <div className="text-right">
                  <Badge className={statusColors[selectedInvoice.status]}>
                    {selectedInvoice.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Invoice Date</p>
                  <p className="font-medium">{format(new Date(selectedInvoice.created_at), "MMM dd, yyyy")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{typeLabels[selectedInvoice.invoice_type] || selectedInvoice.invoice_type}</p>
                </div>
              </div>
              
              {/* Line Items */}
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
                  {selectedInvoice.invoice_items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.products?.name || "Unknown"}</TableCell>
                      <TableCell className="font-mono text-sm">{item.products?.sku || "-"}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="text-right">{item.discount_percent}%</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span>-{formatCurrency(selectedInvoice.discount_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(selectedInvoice.tax_amount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(selectedInvoice.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[hsl(var(--success))]">
                    <span>Paid</span>
                    <span>{formatCurrency(selectedInvoice.paid_amount)}</span>
                  </div>
                  {selectedInvoice.total_amount - selectedInvoice.paid_amount > 0 && (
                    <div className="flex justify-between text-sm text-[hsl(var(--warning))]">
                      <span>Balance Due</span>
                      <span>{formatCurrency(selectedInvoice.total_amount - selectedInvoice.paid_amount)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
