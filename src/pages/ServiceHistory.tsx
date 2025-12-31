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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Wrench, Clock, CheckCircle, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";

const ServiceHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["service-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          customers (name, email, phone),
          invoice_items (
            id,
            quantity,
            unit_price,
            total,
            products (name, sku)
          )
        `)
        .eq("invoice_type", "service")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredInvoices = invoices.filter((invoice) => {
    const customerName = invoice.customers?.name || "";
    const invoiceNumber = invoice.invoice_number || "";
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalServices = invoices.length;
  const completedServices = invoices.filter((i) => i.status === "paid").length;
  const pendingServices = invoices.filter((i) => i.status === "pending").length;
  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total_amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return { label: "Completed", variant: "default" as const };
      case "pending":
        return { label: "Pending", variant: "secondary" as const };
      case "partial":
        return { label: "Partial Payment", variant: "outline" as const };
      case "draft":
        return { label: "Draft", variant: "secondary" as const };
      default:
        return { label: status, variant: "outline" as const };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service History</h1>
          <p className="text-muted-foreground">
            View all service and repair records
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedServices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingServices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Service Records</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial Payment</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading service history...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No service records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const status = getStatusBadge(invoice.status);
                    const serviceItems = invoice.invoice_items || [];
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(invoice.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {invoice.customers?.name || "Walk-in"}
                            </div>
                            {invoice.customers?.phone && (
                              <div className="text-sm text-muted-foreground">
                                {invoice.customers.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {serviceItems.length > 0 ? (
                              <ul className="list-disc list-inside">
                                {serviceItems.slice(0, 2).map((item: any) => (
                                  <li key={item.id} className="truncate max-w-[200px]">
                                    {item.products?.name || "Service Item"}
                                  </li>
                                ))}
                                {serviceItems.length > 2 && (
                                  <li className="text-muted-foreground">
                                    +{serviceItems.length - 2} more
                                  </li>
                                )}
                              </ul>
                            ) : (
                              <span className="text-muted-foreground">No items</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${invoice.total_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={status.variant}>{status.label}</Badge>
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

export default ServiceHistory;
