import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Wallet, Plus, AlertTriangle, TrendingDown, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface FundTransaction {
  id: string;
  branch_id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description: string | null;
  created_by: string;
  created_at: string;
}

const FUND_LIMIT = 1000; // Default fund limit
const LOW_BALANCE_THRESHOLD = 200;

export function FundBalanceCard() {
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [replenishOpen, setReplenishOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [replenishAmount, setReplenishAmount] = useState("");
  const [replenishDescription, setReplenishDescription] = useState("");

  const canManageFund = hasRole("admin") || hasRole("manager");

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  // Fetch fund transactions to calculate current balance
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["petty-cash-fund-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("petty_cash_funds")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as FundTransaction[];
    },
  });

  // Calculate current balance from last transaction
  const currentBalance = transactions.length > 0 
    ? Number(transactions[0].balance_after) 
    : 0;

  const isLowBalance = currentBalance < LOW_BALANCE_THRESHOLD;
  const balancePercentage = Math.min((currentBalance / FUND_LIMIT) * 100, 100);

  // Replenish fund mutation
  const replenishMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(replenishAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount");
      }

      const newBalance = currentBalance + amount;
      const { error } = await supabase.from("petty_cash_funds").insert({
        branch_id: branches[0]?.id,
        transaction_type: "replenishment",
        amount: amount,
        balance_after: newBalance,
        description: replenishDescription.trim() || "Fund replenishment",
        created_by: user?.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petty-cash-fund-transactions"] });
      toast.success("Fund replenished successfully");
      setReplenishOpen(false);
      setReplenishAmount("");
      setReplenishDescription("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to replenish fund");
    },
  });

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "replenishment":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Replenishment</Badge>;
      case "expense":
        return <Badge variant="destructive">Expense</Badge>;
      default:
        return <Badge variant="secondary">Adjustment</Badge>;
    }
  };

  return (
    <>
      <Card className={isLowBalance ? "border-destructive/50" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Fund Balance
            {isLowBalance && (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setHistoryOpen(true)}>
              <History className="h-4 w-4" />
            </Button>
            {canManageFund && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setReplenishOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold ${isLowBalance ? "text-destructive" : ""}`}>
              ${currentBalance.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">/ ${FUND_LIMIT.toFixed(2)}</span>
          </div>
          <Progress value={balancePercentage} className={isLowBalance ? "[&>div]:bg-destructive" : ""} />
          {isLowBalance && (
            <div className="flex items-center gap-1 text-sm text-destructive">
              <TrendingDown className="h-3 w-3" />
              Low balance - replenishment needed
            </div>
          )}
        </CardContent>
      </Card>

      {/* Replenish Dialog */}
      <Dialog open={replenishOpen} onOpenChange={setReplenishOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Replenish Petty Cash Fund</DialogTitle>
            <DialogDescription>
              Add funds to the petty cash balance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={replenishAmount}
                onChange={(e) => setReplenishAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Reason for replenishment..."
                value={replenishDescription}
                onChange={(e) => setReplenishDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="p-3 bg-muted rounded-md text-sm">
              <div className="flex justify-between">
                <span>Current Balance:</span>
                <span>${currentBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>New Balance:</span>
                <span>
                  ${(currentBalance + (parseFloat(replenishAmount) || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplenishOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => replenishMutation.mutate()}
              disabled={replenishMutation.isPending || !replenishAmount}
            >
              {replenishMutation.isPending ? "Adding..." : "Add Funds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fund Transaction History</DialogTitle>
            <DialogDescription>
              View all replenishments, expenses, and adjustments
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No transactions yet
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {format(new Date(tx.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{getTransactionBadge(tx.transaction_type)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {tx.description || "-"}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        tx.transaction_type === "expense" ? "text-destructive" : "text-emerald-600"
                      }`}>
                        {tx.transaction_type === "expense" ? "-" : "+"}${Number(tx.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(tx.balance_after).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
