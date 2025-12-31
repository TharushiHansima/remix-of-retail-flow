import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, CreditCard, AlertTriangle, TrendingUp } from "lucide-react";

const CreditAccounts = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["credit-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
  );

  const totalCreditLimit = customers.reduce(
    (sum, c) => sum + (c.credit_limit || 0),
    0
  );
  const totalCreditUsed = customers.reduce(
    (sum, c) => sum + (c.credit_balance || 0),
    0
  );
  const customersOverLimit = customers.filter(
    (c) => (c.credit_balance || 0) > (c.credit_limit || 0)
  ).length;

  const getCreditStatus = (balance: number, limit: number) => {
    if (limit === 0) return { label: "No Credit", variant: "secondary" as const };
    const utilization = (balance / limit) * 100;
    if (utilization >= 100) return { label: "Over Limit", variant: "destructive" as const };
    if (utilization >= 80) return { label: "High Usage", variant: "default" as const };
    if (utilization >= 50) return { label: "Moderate", variant: "secondary" as const };
    return { label: "Good", variant: "outline" as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credit Accounts</h1>
          <p className="text-muted-foreground">
            Manage customer credit limits and balances
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credit Limit</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalCreditLimit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalCreditUsed.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credit</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalCreditLimit - totalCreditUsed).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Limit</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {customersOverLimit}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer Credit Accounts</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
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
              Loading credit accounts...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Credit Limit</TableHead>
                  <TableHead className="text-right">Balance Used</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => {
                    const status = getCreditStatus(
                      customer.credit_balance || 0,
                      customer.credit_limit || 0
                    );
                    const available =
                      (customer.credit_limit || 0) - (customer.credit_balance || 0);
                    return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {customer.email && <div>{customer.email}</div>}
                            {customer.phone && (
                              <div className="text-muted-foreground">{customer.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          ${(customer.credit_limit || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ${(customer.credit_balance || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={available < 0 ? "text-destructive" : ""}>
                            ${available.toLocaleString()}
                          </span>
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

export default CreditAccounts;
