import { FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";

import { customersApi } from "@/features/customers/customers.api";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: "individual" | "business";
  creditLimit: number;
  balance: number;
  totalPurchases: number;
  lastVisit: string;
  status: "active" | "inactive";
}

interface CustomerInvoicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

type InvoiceStatus = "draft" | "pending" | "paid" | "partial" | "overdue";

type InvoiceUI = {
  id: string;
  invoiceNumber: string;
  date: Date;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  paid: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  partial: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]",
  overdue: "bg-destructive/10 text-destructive",
};

function normalizeListResponse<T>(res: any): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res?.items && Array.isArray(res.items)) return res.items as T[];
  return [];
}

/**
 * Tries to map any backend invoice-ish record to the UI shape.
 * Works with common field names:
 * - invoiceNumber / number / code
 * - createdAt / date / issuedAt
 * - total / totalAmount / grandTotal
 * - paid / paidAmount
 * - status
 */
function toInvoiceUI(raw: any): InvoiceUI {
  const id = String(raw.id ?? raw.invoiceId ?? "");
  const invoiceNumber = String(
    raw.invoiceNumber ??
      raw.number ??
      raw.code ??
      raw.documentNo ??
      raw.invoice_no ??
      id,
  );

  const dateVal = raw.date ?? raw.issuedAt ?? raw.createdAt ?? raw.updatedAt;
  const date = dateVal ? new Date(dateVal) : new Date();

  const totalAmount = Number(
    raw.totalAmount ?? raw.total ?? raw.grandTotal ?? raw.amount ?? 0,
  );
  const paidAmount = Number(raw.paidAmount ?? raw.paid ?? raw.received ?? 0);

  const st = String(raw.status ?? "pending").toLowerCase();
  const status: InvoiceStatus =
    st === "draft" || st === "pending" || st === "paid" || st === "partial" || st === "overdue"
      ? (st as InvoiceStatus)
      : "pending";

  return { id, invoiceNumber, date, totalAmount, paidAmount, status };
}

export function CustomerInvoicesDialog({
  open,
  onOpenChange,
  customer,
}: CustomerInvoicesDialogProps) {
  if (!customer) return null;

  /**
   * ✅ Backend connection
   *
   * This expects you to add `customersApi.listInvoices(customerId)` in customers.api.ts.
   * (snippet below)
   */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["customer-invoices", customer.id],
    enabled: open && !!customer?.id,
    queryFn: async () => {
      const res = await customersApi.listInvoices(customer.id);
      const items = normalizeListResponse<any>(res);
      return items.map(toInvoiceUI);
    },
  });

  const invoices = data ?? [];

  const totalValue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalOutstanding = invoices
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Customer Invoices</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{customer.name}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Total Invoices</p>
            <p className="text-xl font-semibold">{invoices.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-xl font-semibold">
              ${totalValue.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p
              className={`text-xl font-semibold ${
                totalOutstanding > 0
                  ? "text-[hsl(var(--warning))]"
                  : "text-[hsl(var(--success))]"
              }`}
            >
              ${totalOutstanding.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading invoices...
                  </TableCell>
                </TableRow>
              )}

              {isError && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-destructive">
                    {(error as any)?.message || "Failed to load invoices"}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono font-medium">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(invoice.date, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    ${invoice.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${invoice.paidAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${(invoice.totalAmount - invoice.paidAmount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[invoice.status]}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        // Optional: open invoice details page if you have one
                        // window.open(`/sales/invoices/${invoice.id}`, "_blank");
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {!isLoading && !isError && invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No invoices found for this customer
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
