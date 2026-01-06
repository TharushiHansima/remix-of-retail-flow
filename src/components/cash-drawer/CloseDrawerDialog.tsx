import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { z } from "zod";

const closeDrawerSchema = z.object({
  actualClosing: z.number().min(0, { message: "Closing amount must be 0 or greater" }).max(10000000, { message: "Closing amount is too large" }),
  notes: z.string().max(1000, { message: "Notes must be less than 1000 characters" }).optional(),
});

interface CloseDrawerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drawer: {
    id: string;
    opening_float: number;
  };
  expectedBalance: number;
}

export function CloseDrawerDialog({ 
  open, 
  onOpenChange, 
  drawer,
  expectedBalance 
}: CloseDrawerDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [actualClosing, setActualClosing] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Fetch transactions for this drawer
  const { data: transactions = [] } = useQuery({
    queryKey: ["drawer-transactions-summary", drawer.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_transactions")
        .select("*")
        .eq("drawer_id", drawer.id);
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Calculate summaries
  const salesTotal = transactions
    .filter(t => t.transaction_type === "sale")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const refundsTotal = transactions
    .filter(t => t.transaction_type === "refund")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const cashInTotal = transactions
    .filter(t => t.transaction_type === "cash_in")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const cashOutTotal = transactions
    .filter(t => t.transaction_type === "cash_out")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const transactionCount = transactions.length;

  const actualAmount = parseFloat(actualClosing) || 0;
  const variance = actualAmount - expectedBalance;

  const closeDrawerMutation = useMutation({
    mutationFn: async () => {
      const validation = closeDrawerSchema.safeParse({
        actualClosing: actualAmount,
        notes: notes || undefined,
      });
      
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const { data, error } = await supabase
        .from("cash_drawers")
        .update({
          closed_by: user?.id,
          expected_closing: expectedBalance,
          actual_closing: actualAmount,
          variance: variance,
          status: variance === 0 ? "reconciled" : "closed",
          closed_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq("id", drawer.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-drawer"] });
      queryClient.invalidateQueries({ queryKey: ["recent-drawers"] });
      toast.success("Cash drawer closed successfully");
      onOpenChange(false);
      setActualClosing("");
      setNotes("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to close cash drawer");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Close Cash Drawer</DialogTitle>
          <DialogDescription>
            Review the day's summary and enter the actual closing amount.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {/* Day's Summary */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Day's Summary</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Sales</p>
                  <p className="font-semibold text-emerald-600">${salesTotal.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Refunds</p>
                  <p className="font-semibold text-red-600">${refundsTotal.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg">
                <ArrowUpCircle className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Cash In</p>
                  <p className="font-semibold text-blue-600">${cashInTotal.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-lg">
                <ArrowDownCircle className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Cash Out</p>
                  <p className="font-semibold text-orange-600">${cashOutTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} today
            </p>
          </div>

          <Separator />

          {/* Balance Calculation */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Opening Float:</span>
              <span>${drawer.opening_float.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Expected Balance:</span>
              <span>${expectedBalance.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualClosing">Actual Cash Count ($)</Label>
            <Input
              id="actualClosing"
              type="number"
              min="0"
              step="0.01"
              value={actualClosing}
              onChange={(e) => setActualClosing(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {actualClosing && (
            <Alert variant={variance === 0 ? "default" : "destructive"}>
              {variance === 0 ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>
                {variance === 0 ? (
                  "Perfect! The drawer balances correctly."
                ) : (
                  <>
                    Variance: <strong>{variance >= 0 ? "+" : ""}${variance.toFixed(2)}</strong>
                    {variance > 0 ? " (Over)" : " (Short)"}
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this session..."
              rows={3}
              maxLength={1000}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => closeDrawerMutation.mutate()}
            disabled={closeDrawerMutation.isPending || !actualClosing}
          >
            {closeDrawerMutation.isPending ? "Closing..." : "Close Drawer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
