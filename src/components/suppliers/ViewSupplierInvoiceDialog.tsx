import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { FileText, Calendar, DollarSign, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ViewSupplierInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
}

interface SupplierPayment {
  id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

interface InvoiceDetails {
  id: string;
  supplier_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  suppliers: { name: string } | null;
}

export function ViewSupplierInvoiceDialog({
  open,
  onOpenChange,
  invoiceId,
}: ViewSupplierInvoiceDialogProps) {
  const { data: invoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ["supplier-invoice", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      const { data, error } = await supabase
        .from("supplier_invoices")
        .select(`*, suppliers(name)`)
        .eq("id", invoiceId)
        .single();
      if (error) throw error;
      return data as InvoiceDetails;
    },
    enabled: !!invoiceId && open,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["supplier-invoice-payments", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];
      const { data, error } = await supabase
        .from("supplier_payments")
        .select("*")
        .eq("supplier_invoice_id", invoiceId)
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return data as SupplierPayment[];
    },
    enabled: !!invoiceId && open,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default">Paid</Badge>;
      case "partial":
        return <Badge variant="secondary">Partial</Badge>;
      default:
        return <Badge variant="destructive">Unpaid</Badge>;
    }
  };

  const formatPaymentMethod = (method: string) => {
    return method
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const isLoading = invoiceLoading || paymentsLoading;

  if (!invoiceId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Supplier Invoice Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading invoice details...
          </div>
        ) : invoice ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="font-medium">{invoice.invoice_number}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <div>{getStatusBadge(invoice.status)}</div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {invoice.suppliers?.name || "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {format(parseISO(invoice.created_at), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Invoice Date
                </p>
                <p className="font-medium">
                  {format(parseISO(invoice.invoice_date), "MMM d, yyyy")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </p>
                <p className="font-medium">
                  {format(parseISO(invoice.due_date), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Amount Summary
              </h4>
              <div className="bg-muted rounded-md p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${Number(invoice.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${Number(invoice.tax_amount).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${Number(invoice.total_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Paid</span>
                  <span>-${Number(invoice.paid_amount).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Outstanding</span>
                  <span>
                    $
                    {(
                      Number(invoice.total_amount) - Number(invoice.paid_amount)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Payment History</h4>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No payments recorded
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(parseISO(payment.payment_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {formatPaymentMethod(payment.payment_method)}
                        </TableCell>
                        <TableCell>{payment.reference || "-"}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${Number(payment.amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Invoice not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
