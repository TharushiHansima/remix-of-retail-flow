import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import {
  Plus,
  Receipt,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AddPettyCashDialog } from "@/components/petty-cash/AddPettyCashDialog";
import { ViewPettyCashDialog } from "@/components/petty-cash/ViewPettyCashDialog";

const EXPENSE_CATEGORIES = [
  "Office Supplies",
  "Transport",
  "Meals & Entertainment",
  "Repairs & Maintenance",
  "Utilities",
  "Miscellaneous",
];

interface PettyCashExpense {
  id: string;
  branch_id: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  receipt_reference: string | null;
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export default function PettyCash() {
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<PettyCashExpense | null>(null);

  const canApprove = hasRole("admin") || hasRole("manager");

  // Fetch petty cash expenses
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["petty-cash-expenses", categoryFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("petty_cash_expenses")
        .select("*")
        .order("expense_date", { ascending: false });

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PettyCashExpense[];
    },
  });

  // Approve expense mutation
  const approveMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from("petty_cash_expenses")
        .update({
          status: "approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", expenseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petty-cash-expenses"] });
      toast.success("Expense approved");
    },
    onError: () => {
      toast.error("Failed to approve expense");
    },
  });

  // Reject expense mutation
  const rejectMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from("petty_cash_expenses")
        .update({
          status: "rejected",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", expenseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petty-cash-expenses"] });
      toast.success("Expense rejected");
    },
    onError: () => {
      toast.error("Failed to reject expense");
    },
  });

  // Filter expenses by search term
  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.receipt_reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalPending = expenses
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const totalApproved = expenses
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const totalThisMonth = expenses
    .filter((e) => {
      const expenseDate = new Date(e.expense_date);
      const now = new Date();
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Petty Cash</h1>
          <p className="text-muted-foreground">Track and manage petty cash expenses</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Record Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {expenses.filter((e) => e.status === "pending").length} expenses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Total</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalApproved.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {expenses.filter((e) => e.status === "approved").length} expenses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalThisMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expenses Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Receipt #</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading expenses...
                </TableCell>
              </TableRow>
            ) : filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No expenses found
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(new Date(expense.expense_date), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{expense.description}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {expense.receipt_reference || "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${Number(expense.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(expense.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedExpense(expense)}
                      >
                        View
                      </Button>
                      {canApprove && expense.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600"
                            onClick={() => approveMutation.mutate(expense.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => rejectMutation.mutate(expense.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <AddPettyCashDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        categories={EXPENSE_CATEGORIES}
      />
      
      {selectedExpense && (
        <ViewPettyCashDialog
          open={!!selectedExpense}
          onOpenChange={(open) => !open && setSelectedExpense(null)}
          expense={selectedExpense}
        />
      )}
    </div>
  );
}