import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Download, FileSpreadsheet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface ExpenseReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CategorySummary {
  category: string;
  count: number;
  total: number;
}

export function ExpenseReportDialog({
  open,
  onOpenChange,
}: ExpenseReportDialogProps) {
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["petty-cash-report", startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("petty_cash_expenses")
        .select("*")
        .gte("expense_date", startDate)
        .lte("expense_date", endDate)
        .eq("status", "approved")
        .order("expense_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Calculate category summaries
  const categorySummaries: CategorySummary[] = expenses.reduce(
    (acc: CategorySummary[], expense) => {
      const existing = acc.find((s) => s.category === expense.category);
      if (existing) {
        existing.count += 1;
        existing.total += Number(expense.amount);
      } else {
        acc.push({
          category: expense.category,
          count: 1,
          total: Number(expense.amount),
        });
      }
      return acc;
    },
    []
  );

  const grandTotal = categorySummaries.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.length;

  const exportToCSV = () => {
    if (expenses.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Date",
      "Category",
      "Description",
      "Amount",
      "Receipt Reference",
      "Notes",
    ];
    const rows = expenses.map((e) => [
      format(new Date(e.expense_date), "yyyy-MM-dd"),
      e.category,
      e.description,
      Number(e.amount).toFixed(2),
      e.receipt_reference || "",
      e.notes || "",
    ]);

    // Add summary rows
    rows.push([]);
    rows.push(["CATEGORY SUMMARY"]);
    rows.push(["Category", "Count", "Total"]);
    categorySummaries.forEach((s) => {
      rows.push([s.category, s.count.toString(), s.total.toFixed(2)]);
    });
    rows.push([]);
    rows.push(["GRAND TOTAL", totalExpenses.toString(), grandTotal.toFixed(2)]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `petty-cash-report-${startDate}-to-${endDate}.csv`;
    link.click();

    toast.success("Report exported successfully");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Expense Report
          </DialogTitle>
          <DialogDescription>
            Generate expense reports by category with date range filters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-2xl font-bold">{totalExpenses}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-2xl font-bold">${grandTotal.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Count</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading report...
                    </TableCell>
                  </TableRow>
                ) : categorySummaries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No approved expenses in this date range
                    </TableCell>
                  </TableRow>
                ) : (
                  categorySummaries.map((summary) => (
                    <TableRow key={summary.category}>
                      <TableCell className="font-medium">
                        {summary.category}
                      </TableCell>
                      <TableCell className="text-center">{summary.count}</TableCell>
                      <TableCell className="text-right">
                        ${summary.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {grandTotal > 0
                          ? ((summary.total / grandTotal) * 100).toFixed(1)
                          : 0}
                        %
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <Button onClick={exportToCSV} disabled={expenses.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
