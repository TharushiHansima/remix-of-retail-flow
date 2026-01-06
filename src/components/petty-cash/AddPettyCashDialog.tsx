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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { ReceiptUpload } from "./ReceiptUpload";

const expenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
  amount: z.number().positive("Amount must be greater than 0").max(100000, "Amount too large"),
  expense_date: z.string().min(1, "Date is required"),
  receipt_reference: z.string().max(100, "Reference too long").optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
});

interface AddPettyCashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
}

export function AddPettyCashDialog({
  open,
  onOpenChange,
  categories,
}: AddPettyCashDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    receipt_reference: "",
    notes: "",
  });
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Fetch current fund balance
  const { data: fundTransactions = [] } = useQuery({
    queryKey: ["petty-cash-fund-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("petty_cash_funds")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data;
    },
  });

  const currentBalance = fundTransactions.length > 0 
    ? Number(fundTransactions[0].balance_after) 
    : 0;

  const createMutation = useMutation({
    mutationFn: async () => {
      const validation = expenseSchema.safeParse({
        ...formData,
        amount: parseFloat(formData.amount) || 0,
      });

      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        throw new Error("Validation failed");
      }

      setErrors({});

      const amount = parseFloat(formData.amount);
      const branchId = branches[0]?.id;

      // Insert expense
      const { error } = await supabase.from("petty_cash_expenses").insert({
        branch_id: branchId,
        category: formData.category,
        description: formData.description.trim(),
        amount: amount,
        expense_date: formData.expense_date,
        receipt_reference: formData.receipt_reference.trim() || null,
        receipt_url: receiptUrl,
        notes: formData.notes.trim() || null,
        created_by: user?.id,
        status: "pending",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petty-cash-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["petty-cash-fund-transactions"] });
      toast.success("Expense recorded successfully");
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      if (error.message !== "Validation failed") {
        toast.error("Failed to record expense");
      }
    },
  });

  const resetForm = () => {
    setFormData({
      category: "",
      description: "",
      amount: "",
      expense_date: new Date().toISOString().split("T")[0],
      receipt_reference: "",
      notes: "",
    });
    setReceiptUrl(null);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Petty Cash Expense</DialogTitle>
          <DialogDescription>
            Add a new petty cash expense for approval.
            {currentBalance > 0 && (
              <span className="block mt-1">
                Available balance: <strong>${currentBalance.toFixed(2)}</strong>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expense_date">Date</Label>
              <Input
                id="expense_date"
                type="date"
                value={formData.expense_date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, expense_date: e.target.value }))
                }
              />
              {errors.expense_date && (
                <p className="text-sm text-destructive">{errors.expense_date}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              maxLength={500}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Receipt Image (Optional)</Label>
            <ReceiptUpload
              receiptUrl={receiptUrl}
              onUpload={setReceiptUrl}
              onRemove={() => setReceiptUrl(null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt_reference">Receipt Reference (Optional)</Label>
            <Input
              id="receipt_reference"
              placeholder="Receipt number or reference"
              value={formData.receipt_reference}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, receipt_reference: e.target.value }))
              }
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={2}
              maxLength={1000}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Saving..." : "Record Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}