import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  User,
  Smartphone,
  Calendar,
  Phone,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceBill {
  id: string;
  billNumber: string;
  jobCardNumber: string;
  customer: string;
  phone: string;
  device: string;
  status: "draft" | "pending" | "paid" | "partial" | "overdue";
  laborCost: number;
  partsCost: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  createdAt: string;
}

interface ViewBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: ServiceBill | null;
}

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  pending: { label: "Pending", color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]", icon: Clock },
  paid: { label: "Paid", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", icon: CheckCircle2 },
  partial: { label: "Partial", color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]", icon: DollarSign },
  overdue: { label: "Overdue", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

export function ViewBillDialog({ open, onOpenChange, bill }: ViewBillDialogProps) {
  if (!bill) return null;

  const StatusIcon = statusConfig[bill.status].icon;
  const balance = bill.totalAmount - bill.paidAmount;
  const subtotal = bill.laborCost + bill.partsCost;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{bill.billNumber}</DialogTitle>
              <DialogDescription>Service bill details</DialogDescription>
            </div>
            <Badge className={cn("gap-1", statusConfig[bill.status].color)}>
              <StatusIcon className="h-3 w-3" />
              {statusConfig[bill.status].label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Job & Customer Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Job & Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Job Card</p>
                  <p className="text-sm font-medium text-foreground">{bill.jobCardNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="text-sm font-medium text-foreground">{bill.customer}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">{bill.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Device</p>
                  <p className="text-sm font-medium text-foreground">{bill.device}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Cost Breakdown</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Labor Cost</span>
                  <span className="text-foreground">${bill.laborCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Parts Cost</span>
                  <span className="text-foreground">${bill.partsCost.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                {bill.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-destructive">-${bill.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">${bill.tax.toFixed(2)}</span>
                </div>
              </div>
              <Separator />
              <div className="p-4 bg-muted/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Total Amount</span>
                  <span className="text-xl font-bold text-foreground">${bill.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Payment Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-[hsl(var(--success))]/10 rounded-lg">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-lg font-medium text-[hsl(var(--success))]">${bill.paidAmount.toFixed(2)}</p>
              </div>
              <div className={cn(
                "p-3 rounded-lg",
                balance > 0 ? "bg-destructive/10" : "bg-muted/50"
              )}>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className={cn(
                  "text-lg font-medium",
                  balance > 0 ? "text-destructive" : "text-foreground"
                )}>
                  ${balance.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className={cn(
                  "text-lg font-medium",
                  bill.status === "overdue" ? "text-destructive" : "text-foreground"
                )}>
                  {bill.dueDate}
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Created On</p>
              <p className="text-sm font-medium text-foreground">{bill.createdAt}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
