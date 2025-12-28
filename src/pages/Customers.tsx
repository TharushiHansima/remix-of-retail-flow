import { useState } from "react";
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

const customers: Customer[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 234 567 8901",
    address: "123 Main St, New York, NY",
    type: "individual",
    creditLimit: 5000,
    balance: 1250,
    totalPurchases: 15420,
    lastVisit: "2024-01-28",
    status: "active",
  },
  {
    id: "2",
    name: "ABC Corporation",
    email: "accounts@abccorp.com",
    phone: "+1 234 567 8902",
    address: "456 Business Ave, Los Angeles, CA",
    type: "business",
    creditLimit: 50000,
    balance: 12500,
    totalPurchases: 245000,
    lastVisit: "2024-01-27",
    status: "active",
  },
  {
    id: "3",
    name: "Sarah Davis",
    email: "sarah.d@email.com",
    phone: "+1 234 567 8903",
    address: "789 Oak Lane, Chicago, IL",
    type: "individual",
    creditLimit: 2000,
    balance: 0,
    totalPurchases: 8750,
    lastVisit: "2024-01-25",
    status: "active",
  },
  {
    id: "4",
    name: "Tech Solutions Inc",
    email: "info@techsolutions.com",
    phone: "+1 234 567 8904",
    address: "321 Innovation Blvd, San Francisco, CA",
    type: "business",
    creditLimit: 25000,
    balance: 5240,
    totalPurchases: 78900,
    lastVisit: "2024-01-20",
    status: "active",
  },
  {
    id: "5",
    name: "Michael Brown",
    email: "m.brown@email.com",
    phone: "+1 234 567 8905",
    address: "654 Pine St, Seattle, WA",
    type: "individual",
    creditLimit: 0,
    balance: 0,
    totalPurchases: 2340,
    lastVisit: "2024-01-15",
    status: "inactive",
  },
];

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Customers</p>
          <p className="text-2xl font-bold text-card-foreground">{customers.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Business Accounts</p>
          <p className="text-2xl font-bold text-card-foreground">
            {customers.filter((c) => c.type === "business").length}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Receivables</p>
          <p className="text-2xl font-bold text-[hsl(var(--warning))]">
            ${customers.reduce((sum, c) => sum + c.balance, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Lifetime Value</p>
          <p className="text-2xl font-bold text-[hsl(var(--success))]">
            ${customers.reduce((sum, c) => sum + c.totalPurchases, 0).toLocaleString()}
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

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
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-card-foreground">{customer.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-48">{customer.address}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {customer.type === "business" ? "Business" : "Individual"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {customer.creditLimit > 0 ? (
                    <div className="flex items-center justify-end gap-1">
                      <CreditCard className="h-3 w-3 text-muted-foreground" />
                      <span>${customer.creditLimit.toLocaleString()}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {customer.balance > 0 ? (
                    <span className="font-medium text-[hsl(var(--warning))]">
                      ${customer.balance.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-[hsl(var(--success))]">$0</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${customer.totalPurchases.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {customer.lastVisit}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Customer
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        View Invoices
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
