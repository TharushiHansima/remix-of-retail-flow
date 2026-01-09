import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Phone,
  Mail,
  MapPin,
  CreditCard,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";
import { ViewCustomerDialog } from "@/components/customers/ViewCustomerDialog";
import { EditCustomerDialog } from "@/components/customers/EditCustomerDialog";
import { CustomerInvoicesDialog } from "@/components/customers/CustomerInvoicesDialog";

import { customersApi } from "@/features/customers/customers.api";
import type {
  Customer as CustomerApi,
  CustomersStats,
} from "@/features/customers/customers.types";

/** =========================
 * UI Customer (keep old UI shape)
 * ========================= */
interface CustomerUI {
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
  isActive: boolean;
  status: "active" | "inactive";
}

function toCustomerUI(c: CustomerApi): CustomerUI {
  const isActive = Boolean((c as any).isActive);
  return {
    id: c.id,
    name: c.name ?? "",
    email: c.email ?? "",
    phone: c.phone ?? "",
    address: c.address ?? "",
    type: (c.type ?? "individual") as "individual" | "business",
    creditLimit: Number((c as any).creditLimit ?? 0),
    balance: Number((c as any).balance ?? 0),
    totalPurchases: Number((c as any).totalPurchases ?? 0),
    lastVisit: (c as any).lastVisit ?? "",
    isActive,
    status: isActive ? "active" : "inactive",
  };
}

function normalizeListResponse(res: any): { items: CustomerApi[]; total: number } {
  if (Array.isArray(res)) return { items: res, total: res.length };
  if (res?.items && Array.isArray(res.items))
    return { items: res.items, total: Number(res.total ?? res.items.length) };
  return { items: [], total: 0 };
}

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInvoicesDialogOpen, setIsInvoicesDialogOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerUI | null>(
    null,
  );

  // ✅ real data state
  const [rows, setRows] = useState<CustomerUI[]>([]);
  const [stats, setStats] = useState<CustomersStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // optional paging
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);

  const fetchAll = async (q: string, p: number) => {
    setLoading(true);
    setError(null);

    // ✅ list should load even if stats fails
    try {
      const listRes = await customersApi.list({ search: q, page: p, pageSize });
      const normalized = normalizeListResponse(listRes);
      setRows(normalized.items.map(toCustomerUI));
      setTotal(normalized.total);
    } catch (e: any) {
      setError(e?.message || "Failed to load customers");
    }

    // stats should never block table
    try {
      const statsRes = await customersApi.stats();
      setStats(statsRes);
    } catch {
      // ignore stats errors
    }

    setLoading(false);
  };

  // ✅ debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      fetchAll(searchQuery, page);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, page]);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return rows;
    const s = searchQuery.toLowerCase();
    return rows.filter(
      (c) =>
        (c.name ?? "").toLowerCase().includes(s) ||
        (c.email ?? "").toLowerCase().includes(s) ||
        (c.phone ?? "").includes(searchQuery),
    );
  }, [rows, searchQuery]);

  const handleViewProfile = (customer: CustomerUI) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handleEditCustomer = (customer: CustomerUI) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleViewInvoices = (customer: CustomerUI) => {
    setSelectedCustomer(customer);
    setIsInvoicesDialogOpen(true);
  };

  const handleRefresh = () => fetchAll(searchQuery, page);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Dialogs */}
      <AddCustomerDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleRefresh}
      />
      <ViewCustomerDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        customer={selectedCustomer}
      />
      <EditCustomerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        customer={selectedCustomer}
        onSuccess={handleRefresh}
      />
      {/* Uncomment when you wire invoices endpoint */}
      <CustomerInvoicesDialog
        open={isInvoicesDialogOpen}
        onOpenChange={setIsInvoicesDialogOpen}
        customer={selectedCustomer}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Customers</p>
          <p className="text-2xl font-bold text-card-foreground">
            {stats ? stats.totalCustomers : "—"}
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Business Accounts</p>
          <p className="text-2xl font-bold text-card-foreground">
            {stats ? stats.businessAccounts : "—"}
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Receivables</p>
          <p className="text-2xl font-bold text-[hsl(var(--warning))]">
            {stats
              ? `$${Number(stats.totalReceivables || 0).toLocaleString()}`
              : "—"}
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Lifetime Value</p>
          <p className="text-2xl font-bold text-[hsl(var(--success))]">
            {stats
              ? `$${Number(stats.lifetimeValue || 0).toLocaleString()}`
              : "—"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => {
              setPage(1);
              setSearchQuery(e.target.value);
            }}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Credit Limit</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Total Purchases</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>

         <TableBody>
  {filteredCustomers.length === 0 ? (
    <TableRow>
      <TableCell colSpan={8} className="h-48">
        <EmptyState
          variant={searchQuery ? "no-results" : "no-data"}
          title={
            searchQuery
              ? "No customers match your search"
              : "No customers yet"
          }
          description={
            searchQuery
              ? "Try different search terms"
              : "Get started by adding your first customer"
          }
          action={
            !searchQuery
              ? { label: "Add Customer", onClick: () => setIsAddDialogOpen(true) }
              : undefined
          }
        />
      </TableCell>
    </TableRow>
  ) : (
    filteredCustomers.map((customer) => (
      <TableRow key={customer.id} className="hover:bg-muted/30">
        {/* Customer */}
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {(customer.name || "C")
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-card-foreground">
                {customer.name}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-48">
                  {customer.address || "—"}
                </span>
              </div>
            </div>
          </div>
        </TableCell>

        {/* Contact */}
        <TableCell>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{customer.phone || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate max-w-56">{customer.email || "—"}</span>
            </div>
          </div>
        </TableCell>

        {/* Type */}
        <TableCell>
          <Badge variant="secondary">
            {customer.type === "business" ? "Business" : "Individual"}
          </Badge>
        </TableCell>

        {/* Credit Limit */}
        <TableCell className="text-right">
          {Number(customer.creditLimit || 0).toLocaleString()}
        </TableCell>

        {/* Balance */}
        <TableCell className="text-right">
          {Number(customer.balance || 0).toLocaleString()}
        </TableCell>

        {/* Total Purchases */}
        <TableCell className="text-right">
          {Number(customer.totalPurchases || 0).toLocaleString()}
        </TableCell>

        {/* Last Visit */}
        <TableCell>{customer.lastVisit || "—"}</TableCell>

        {/* Actions */}
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewProfile(customer)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleViewInvoices(customer)}>
                <FileText className="h-4 w-4 mr-2" />
                Invoices
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

      {/* Optional pagination */}
      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
        <span>
          Showing {rows.length} of {total}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={loading || (page * pageSize >= total && total !== 0)}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
