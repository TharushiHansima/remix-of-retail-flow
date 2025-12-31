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
import { supabase } from "@/integrations/supabase/client";

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

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  paid: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  partial: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]",
  overdue: "bg-destructive/10 text-destructive",
};

// Mock invoices - in production this would fetch from database
const mockInvoices = [
  {
    id: "1",
    invoiceNumber: "INV-2024-0125",
    date: new Date("2024-01-25"),
    totalAmount: 2450,
    paidAmount: 2450,
    status: "paid",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-0118",
    date: new Date("2024-01-18"),
    totalAmount: 1850,
    paidAmount: 1000,
    status: "partial",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-0110",
    date: new Date("2024-01-10"),
    totalAmount: 3200,
    paidAmount: 3200,
    status: "paid",
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-0105",
    date: new Date("2024-01-05"),
    totalAmount: 980,
    paidAmount: 0,
    status: "pending",
  },
];

export function CustomerInvoicesDialog({
  open,
  onOpenChange,
  customer,
}: CustomerInvoicesDialogProps) {
  if (!customer) return null;

  const totalOutstanding = mockInvoices
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
            <p className="text-xl font-semibold">{mockInvoices.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-xl font-semibold">
              ${mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className={`text-xl font-semibold ${totalOutstanding > 0 ? "text-[hsl(var(--warning))]" : "text-[hsl(var(--success))]"}`}>
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
              {mockInvoices.map((invoice) => (
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
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {mockInvoices.length === 0 && (
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
