import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, differenceInDays, parseISO } from "date-fns";
import {
  Plus,
  Search,
  Clock,
  AlertTriangle,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateSupplierInvoiceDialog } from "@/components/suppliers/CreateSupplierInvoiceDialog";

interface AgingBucket {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
}

interface SupplierInvoice {
  id: string;
  supplier_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  suppliers?: { name: string };
}

interface PaymentForm {
  supplier_invoice_id: string;
  amount: number;
  payment_method: string;
  reference: string;
  notes: string;
}

const emptyPaymentForm: PaymentForm = {
  supplier_invoice_id: "",
  amount: 0,
  payment_method: "bank_transfer",
  reference: "",
  notes: "",
};

const PayablesAging = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>(emptyPaymentForm);
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["supplier-invoices-aging"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_invoices")
        .select(`*, suppliers(name)`)
        .neq("status", "paid")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as SupplierInvoice[];
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentForm) => {
      const { error } = await supabase.from("supplier_payments").insert({
        supplier_invoice_id: data.supplier_invoice_id,
        amount: data.amount,
        payment_method: data.payment_method,
        reference: data.reference || null,
        notes: data.notes || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-invoices-aging"] });
      setPaymentDialogOpen(false);
      setPaymentForm(emptyPaymentForm);
      setSelectedInvoice(null);
      toast.success("Payment recorded");
    },
    onError: () => {
      toast.error("Failed to record payment");
    },
  });

  const getAgingDays = (dueDate: string) => {
    return differenceInDays(new Date(), parseISO(dueDate));
  };

  const getAgingBucket = (days: number): keyof AgingBucket => {
    if (days <= 0) return "current";
    if (days <= 30) return "days30";
    if (days <= 60) return "days60";
    if (days <= 90) return "days90";
    return "over90";
  };

  const getAgingBadge = (days: number) => {
    if (days <= 0) return { label: "Current", variant: "outline" as const };
    if (days <= 30) return { label: "1-30 Days", variant: "secondary" as const };
    if (days <= 60) return { label: "31-60 Days", variant: "default" as const };
    if (days <= 90) return { label: "61-90 Days", variant: "destructive" as const };
    return { label: "90+ Days", variant: "destructive" as const };
  };

  const agingSummary = invoices.reduce<AgingBucket>(
    (acc, invoice) => {
      const days = getAgingDays(invoice.due_date);
      const bucket = getAgingBucket(days);
      const outstanding = Number(invoice.total_amount) - Number(invoice.paid_amount);
      acc[bucket] += outstanding;
      return acc;
    },
    { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 }
  );

  const totalPayables = Object.values(agingSummary).reduce((a, b) => a + b, 0);

  const filteredInvoices = invoices.filter((invoice) => {
    const supplierName = invoice.suppliers?.name || "";
    const invoiceNumber = invoice.invoice_number || "";
    return (
      supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleRecordPayment = (invoice: SupplierInvoice) => {
    setSelectedInvoice(invoice);
    const outstanding = Number(invoice.total_amount) - Number(invoice.paid_amount);
    setPaymentForm({
      ...emptyPaymentForm,
      supplier_invoice_id: invoice.id,
      amount: outstanding,
    });
    setPaymentDialogOpen(true);
  };

  const handleSubmitPayment = () => {
    if (paymentForm.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    paymentMutation.mutate(paymentForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payables Aging</h1>
          <p className="text-muted-foreground">
            Track outstanding supplier invoices by age
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Invoice
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current (Not Due)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${agingSummary.current.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">1-30 Days</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${agingSummary.days30.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">31-60 Days</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${agingSummary.days60.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">61-90 Days</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${agingSummary.days90.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over 90 Days</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${agingSummary.over90.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Payables</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalPayables.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Outstanding Invoices</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading payables...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-center">Age</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No outstanding invoices
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const days = getAgingDays(invoice.due_date);
                    const aging = getAgingBadge(days);
                    const outstanding = Number(invoice.total_amount) - Number(invoice.paid_amount);
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>{invoice.suppliers?.name || "-"}</TableCell>
                        <TableCell>
                          {format(parseISO(invoice.invoice_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(invoice.due_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          ${Number(invoice.total_amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ${Number(invoice.paid_amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${outstanding.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {days > 0 ? `${days} days` : "Not due"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={aging.variant}>{aging.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRecordPayment(invoice)}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for invoice {selectedInvoice?.invoice_number} to{" "}
              {selectedInvoice?.suppliers?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={paymentForm.payment_method}
                onValueChange={(v) => setPaymentForm({ ...paymentForm, payment_method: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reference (Optional)</Label>
              <Input
                placeholder="Check number, transaction ID, etc."
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input
                placeholder="Additional notes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitPayment} disabled={paymentMutation.isPending}>
              {paymentMutation.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateSupplierInvoiceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default PayablesAging;
