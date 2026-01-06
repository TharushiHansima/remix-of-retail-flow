import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface PettyCashExpense {
  id: string;
  branch_id: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  receipt_reference: string | null;
  receipt_url?: string | null;
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

interface ViewPettyCashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: PettyCashExpense;
}

export function ViewPettyCashDialog({
  open,
  onOpenChange,
  expense,
}: ViewPettyCashDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Expense Details
            {getStatusBadge(expense.status)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {format(new Date(expense.expense_date), "MMMM d, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-xl font-bold">${Number(expense.amount).toFixed(2)}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <Badge variant="outline" className="mt-1">{expense.category}</Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="mt-1">{expense.description}</p>
          </div>

          {expense.receipt_url && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Receipt Image</p>
              <div className="relative rounded-lg overflow-hidden border bg-muted/50">
                <img
                  src={expense.receipt_url}
                  alt="Receipt"
                  className="w-full h-40 object-cover"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={() => window.open(expense.receipt_url!, "_blank")}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Full
                </Button>
              </div>
            </div>
          )}

          {expense.receipt_reference && (
            <div>
              <p className="text-sm text-muted-foreground">Receipt Reference</p>
              <p className="mt-1 font-mono text-sm">{expense.receipt_reference}</p>
            </div>
          )}

          {expense.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="mt-1 text-sm">{expense.notes}</p>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p>{format(new Date(expense.created_at), "MMM d, yyyy h:mm a")}</p>
            </div>
            {expense.approved_at && (
              <div>
                <p className="text-muted-foreground">
                  {expense.status === "approved" ? "Approved" : "Reviewed"}
                </p>
                <p>{format(new Date(expense.approved_at), "MMM d, yyyy h:mm a")}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}