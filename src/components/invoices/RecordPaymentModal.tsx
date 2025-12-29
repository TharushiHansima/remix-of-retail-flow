import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Banknote, Building2, Smartphone, Loader2, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useConfig } from "@/contexts/ConfigContext";
import { toast } from "sonner";

const paymentMethods = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  { id: "mobile_money", label: "Mobile Money", icon: Smartphone },
];

interface PaymentEntry {
  id: string;
  method: string;
  amount: number;
  reference: string;
}

interface RecordPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  onSuccess: () => void;
}

export function RecordPaymentModal({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  totalAmount,
  paidAmount,
  onSuccess,
}: RecordPaymentModalProps) {
  const { user } = useAuth();
  const { formatCurrency, isFeatureEnabled } = useConfig();
  const [saving, setSaving] = useState(false);
  const [payments, setPayments] = useState<PaymentEntry[]>([
    { id: "1", method: "cash", amount: totalAmount - paidAmount, reference: "" },
  ]);

  const balanceDue = totalAmount - paidAmount;
  const totalPayment = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = balanceDue - totalPayment;
  const splitPaymentsEnabled = isFeatureEnabled("split_payments");

  const addPayment = () => {
    setPayments([
      ...payments,
      { id: Date.now().toString(), method: "cash", amount: Math.max(0, remaining), reference: "" },
    ]);
  };

  const removePayment = (id: string) => {
    if (payments.length > 1) {
      setPayments(payments.filter((p) => p.id !== id));
    }
  };

  const updatePayment = (id: string, updates: Partial<PaymentEntry>) => {
    setPayments(payments.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleSubmit = async () => {
    if (totalPayment <= 0) {
      toast.error("Payment amount must be greater than zero");
      return;
    }

    if (totalPayment > balanceDue) {
      toast.error("Payment amount exceeds balance due");
      return;
    }

    setSaving(true);
    try {
      // Insert all payments
      const paymentRecords = payments
        .filter((p) => p.amount > 0)
        .map((p) => ({
          invoice_id: invoiceId,
          amount: p.amount,
          payment_method: p.method,
          reference: p.reference || null,
          created_by: user?.id,
        }));

      const { error: paymentError } = await supabase
        .from("payments")
        .insert(paymentRecords);

      if (paymentError) throw paymentError;

      // Update invoice paid amount and status
      const newPaidAmount = paidAmount + totalPayment;
      const newStatus = newPaidAmount >= totalAmount ? "paid" : "partial";

      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          paid_amount: newPaidAmount,
          status: newStatus,
        })
        .eq("id", invoiceId);

      if (updateError) throw updateError;

      toast.success(`Payment of ${formatCurrency(totalPayment)} recorded successfully`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  const getMethodIcon = (methodId: string) => {
    const method = paymentMethods.find((m) => m.id === methodId);
    return method ? <method.icon className="h-4 w-4" /> : null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record payment for invoice {invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invoice Summary */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Invoice Total</span>
              <span className="font-medium">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Already Paid</span>
              <span className="text-[hsl(var(--success))]">{formatCurrency(paidAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Balance Due</span>
              <span className="text-[hsl(var(--warning))]">{formatCurrency(balanceDue)}</span>
            </div>
          </div>

          {/* Payment Entries */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Payment Details</Label>
              {splitPaymentsEnabled && payments.length < 4 && (
                <Button variant="outline" size="sm" onClick={addPayment}>
                  <Plus className="h-4 w-4 mr-1" />
                  Split Payment
                </Button>
              )}
            </div>

            {payments.map((payment, index) => (
              <div key={payment.id} className="p-3 rounded-lg border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {payments.length > 1 ? `Payment ${index + 1}` : "Payment"}
                  </span>
                  {payments.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removePayment(payment.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Method</Label>
                    <Select
                      value={payment.method}
                      onValueChange={(value) => updatePayment(payment.id, { method: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            <div className="flex items-center gap-2">
                              <method.icon className="h-4 w-4" />
                              {method.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Amount</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      max={balanceDue}
                      value={payment.amount}
                      onChange={(e) =>
                        updatePayment(payment.id, {
                          amount: Math.min(parseFloat(e.target.value) || 0, balanceDue),
                        })
                      }
                    />
                  </div>
                </div>

                {(payment.method === "card" ||
                  payment.method === "bank_transfer" ||
                  payment.method === "mobile_money") && (
                  <div className="space-y-1">
                    <Label className="text-xs">Reference / Transaction ID</Label>
                    <Input
                      placeholder="Enter reference number..."
                      value={payment.reference}
                      onChange={(e) =>
                        updatePayment(payment.id, { reference: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Payment</span>
              <span className="font-medium">{formatCurrency(totalPayment)}</span>
            </div>
            {remaining > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining Balance</span>
                <span className="text-[hsl(var(--warning))]">{formatCurrency(remaining)}</span>
              </div>
            )}
            {remaining <= 0 && totalPayment === balanceDue && (
              <p className="text-xs text-[hsl(var(--success))] text-center pt-1">
                Invoice will be marked as fully paid
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || totalPayment <= 0}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              getMethodIcon(payments[0]?.method)
            )}
            <span className="ml-2">Record {formatCurrency(totalPayment)}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
