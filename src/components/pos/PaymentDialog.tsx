import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Banknote, CreditCard, Smartphone, CheckCircle } from "lucide-react";

type PaymentMethod = "cash" | "card" | "mobile";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (method: PaymentMethod, amountPaid: number) => void;
  total: number;
}

export function PaymentDialog({
  open,
  onClose,
  onComplete,
  total,
}: PaymentDialogProps) {
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [amountPaid, setAmountPaid] = useState(total.toString());

  const paidAmount = parseFloat(amountPaid) || 0;
  const change = paidAmount - total;

  const handleComplete = () => {
    if (method === "cash" && paidAmount < total) return;
    onComplete(method, paidAmount);
  };

  const quickAmounts = [
    Math.ceil(total),
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Total */}
          <div className="text-center py-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={method === "cash" ? "default" : "outline"}
              onClick={() => setMethod("cash")}
              className="flex-col gap-1 h-auto py-3"
            >
              <Banknote className="h-5 w-5" />
              <span className="text-xs">Cash</span>
            </Button>
            <Button
              variant={method === "card" ? "default" : "outline"}
              onClick={() => setMethod("card")}
              className="flex-col gap-1 h-auto py-3"
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-xs">Card</span>
            </Button>
            <Button
              variant={method === "mobile" ? "default" : "outline"}
              onClick={() => setMethod("mobile")}
              className="flex-col gap-1 h-auto py-3"
            >
              <Smartphone className="h-5 w-5" />
              <span className="text-xs">Mobile</span>
            </Button>
          </div>

          {/* Cash Payment */}
          {method === "cash" && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="amount">Amount Received</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="text-lg font-medium"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmountPaid(amount.toString())}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>

              {change >= 0 && paidAmount > 0 && (
                <div className="p-3 bg-[hsl(var(--success))]/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Change Due:</span>
                    <span className="text-xl font-bold text-[hsl(var(--success))]">
                      ${change.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card Payment */}
          {method === "card" && (
            <div className="text-center py-6 bg-secondary/30 rounded-lg">
              <CreditCard className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Waiting for card payment...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Insert or tap card on terminal
              </p>
            </div>
          )}

          {/* Mobile Payment */}
          {method === "mobile" && (
            <div className="text-center py-6 bg-secondary/30 rounded-lg">
              <Smartphone className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Scan QR code or enter reference
              </p>
              <Input placeholder="Payment reference..." className="mt-3" />
            </div>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              className="flex-1 gap-2"
              disabled={method === "cash" && paidAmount < total}
            >
              <CheckCircle className="h-4 w-4" />
              Complete Sale
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
