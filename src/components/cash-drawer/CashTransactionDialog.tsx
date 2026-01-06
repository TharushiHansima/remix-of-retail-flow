import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Minus } from "lucide-react";
import { z } from "zod";

const transactionSchema = z.object({
  amount: z.number().positive({ message: "Amount must be greater than 0" }).max(1000000, { message: "Amount is too large" }),
  reason: z.string().trim().min(1, { message: "Please select or enter a reason" }).max(200, { message: "Reason must be less than 200 characters" }),
  reference: z.string().trim().max(100, { message: "Reference must be less than 100 characters" }).optional(),
});

interface CashTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "cash_in" | "cash_out";
  drawerId: string;
}

const CASH_IN_REASONS = [
  "Opening float adjustment",
  "Customer payment",
  "Advance payment",
  "Other income",
  "Bank deposit return",
  "Petty cash refill",
];

const CASH_OUT_REASONS = [
  "Bank deposit",
  "Petty cash expense",
  "Supplier payment",
  "Refund to customer",
  "Office supplies",
  "Transportation",
  "Other expense",
];

export function CashTransactionDialog({ 
  open, 
  onOpenChange, 
  type,
  drawerId 
}: CashTransactionDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [reference, setReference] = useState<string>("");

  const reasons = type === "cash_in" ? CASH_IN_REASONS : CASH_OUT_REASONS;
  const isCashIn = type === "cash_in";

  const createTransactionMutation = useMutation({
    mutationFn: async () => {
      const amountValue = parseFloat(amount) || 0;
      const finalReason = reason === "other" ? customReason : reason;
      
      const validation = transactionSchema.safeParse({
        amount: amountValue,
        reason: finalReason,
        reference: reference || undefined,
      });
      
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const { data, error } = await supabase
        .from("cash_transactions")
        .insert({
          drawer_id: drawerId,
          transaction_type: type,
          amount: amountValue,
          reason: finalReason,
          reference: reference || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drawer-transactions", drawerId] });
      toast.success(`Cash ${isCashIn ? "in" : "out"} recorded successfully`);
      onOpenChange(false);
      setAmount("");
      setReason("");
      setCustomReason("");
      setReference("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record transaction");
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    setAmount("");
    setReason("");
    setCustomReason("");
    setReference("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCashIn ? (
              <Plus className="h-5 w-5 text-green-500" />
            ) : (
              <Minus className="h-5 w-5 text-red-500" />
            )}
            {isCashIn ? "Cash In" : "Cash Out"}
          </DialogTitle>
          <DialogDescription>
            Record a {isCashIn ? "cash in" : "cash out"} transaction for the current drawer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
                <SelectItem value="other">Other (specify)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reason === "other" && (
            <div className="space-y-2">
              <Label htmlFor="customReason">Specify Reason</Label>
              <Input
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter reason..."
                maxLength={200}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Receipt number, invoice ID, etc."
              maxLength={100}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => createTransactionMutation.mutate()}
            disabled={createTransactionMutation.isPending || !amount || (!reason || (reason === "other" && !customReason))}
            variant={isCashIn ? "default" : "destructive"}
          >
            {createTransactionMutation.isPending ? "Recording..." : `Record ${isCashIn ? "Cash In" : "Cash Out"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
