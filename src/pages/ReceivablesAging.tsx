import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Clock, AlertTriangle, DollarSign } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

interface AgingBucket {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
}

const ReceivablesAging = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["receivables-aging"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          customers (name, email, phone)
        `)
        .neq("status", "paid")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getAgingDays = (createdAt: string) => {
    return differenceInDays(new Date(), parseISO(createdAt));
  };

  const getAgingBucket = (days: number): keyof AgingBucket => {
    if (days <= 30) return "current";
    if (days <= 60) return "days30";
    if (days <= 90) return "days60";
    if (days <= 120) return "days90";
    return "over90";
  };

  const getAgingBadge = (days: number) => {
    if (days <= 30) return { label: "Current", variant: "outline" as const };
    if (days <= 60) return { label: "31-60 Days", variant: "secondary" as const };
    if (days <= 90) return { label: "61-90 Days", variant: "default" as const };
    return { label: "90+ Days", variant: "destructive" as const };
  };

  const agingSummary = invoices.reduce<AgingBucket>(
    (acc, invoice) => {
      const days = getAgingDays(invoice.created_at);
      const bucket = getAgingBucket(days);
      const outstanding = invoice.total_amount - invoice.paid_amount;
      acc[bucket] += outstanding;
      return acc;
    },
    { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 }
  );

  const totalReceivables = Object.values(agingSummary).reduce((a, b) => a + b, 0);

  const filteredInvoices = invoices.filter((invoice) => {
    const customerName = invoice.customers?.name || "";
    const invoiceNumber = invoice.invoice_number || "";
    return (
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receivables Aging</h1>
          <p className="text-muted-foreground">
            Track outstanding invoices by age
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current (0-30)</CardTitle>
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
            <CardTitle className="text-sm font-medium">31-60 Days</CardTitle>
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
            <CardTitle className="text-sm font-medium">61-90 Days</CardTitle>
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
            <CardTitle className="text-sm font-medium">91-120 Days</CardTitle>
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
            <CardTitle className="text-sm font-medium">Over 120 Days</CardTitle>
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
          <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            ${totalReceivables.toLocaleString()}
          </div>
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
              Loading receivables...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-center">Age</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No outstanding invoices
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const days = getAgingDays(invoice.created_at);
                    const aging = getAgingBadge(days);
                    const outstanding = invoice.total_amount - invoice.paid_amount;
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>{invoice.customers?.name || "Walk-in"}</TableCell>
                        <TableCell className="text-right">
                          ${invoice.total_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ${invoice.paid_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${outstanding.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">{days} days</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={aging.variant}>{aging.label}</Badge>
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
    </div>
  );
};

export default ReceivablesAging;
