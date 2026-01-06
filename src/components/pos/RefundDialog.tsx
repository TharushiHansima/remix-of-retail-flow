import { useState } from "react";
import { RotateCcw, Search, Receipt } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RefundDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (refundData: {
    invoiceNumber: string;
    amount: number;
    reason: string;
    paymentMethod: string;
  }) => void;
  hasActiveDrawer: boolean;
}

const REFUND_REASONS = [
  "Customer changed mind",
  "Defective product",
  "Wrong item delivered",
  "Price adjustment",
  "Duplicate purchase",
  "Other",
];

// Mock recent invoices for demo
const recentInvoices = [
  { id: "INV-12345678", total: 1199, date: "2024-01-15", customer: "John Smith" },
  { id: "INV-12345679", total: 249, date: "2024-01-15", customer: "Jane Doe" },
  { id: "INV-12345680", total: 45, date: "2024-01-14", customer: "Walk-in" },
];

export function RefundDialog({ open, onClose, onComplete, hasActiveDrawer }: RefundDialogProps) {
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<typeof recentInvoices[0] | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "original">("original");

  const handleClose = () => {
    setInvoiceSearch("");
    setSelectedInvoice(null);
    setRefundAmount("");
    setReason("");
    setCustomReason("");
    setPaymentMethod("original");
    onClose();
  };

  const handleSelectInvoice = (invoice: typeof recentInvoices[0]) => {
    setSelectedInvoice(invoice);
    setRefundAmount(invoice.total.toString());
  };

  const handleSubmit = () => {
    if (!selectedInvoice || !refundAmount || !reason) return;

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedInvoice.total) return;

    onComplete({
      invoiceNumber: selectedInvoice.id,
      amount,
      reason: reason === "Other" ? customReason : reason,
      paymentMethod,
    });
    handleClose();
  };

  const filteredInvoices = recentInvoices.filter(
    (inv) =>
      inv.id.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.customer.toLowerCase().includes(invoiceSearch.toLowerCase())
  );

  const isValid =
    selectedInvoice &&
    refundAmount &&
    parseFloat(refundAmount) > 0 &&
    parseFloat(refundAmount) <= selectedInvoice.total &&
    reason &&
    (reason !== "Other" || customReason.trim());

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Process Refund
          </DialogTitle>
          <DialogDescription>
            Search for an invoice and process a refund.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedInvoice ? (
            <>
              {/* Invoice Search */}
              <div className="space-y-2">
                <Label>Search Invoice</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Invoice number or customer name..."
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Recent Invoices */}
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">
                  {invoiceSearch ? "Search Results" : "Recent Invoices"}
                </Label>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {filteredInvoices.map((invoice) => (
                    <button
                      key={invoice.id}
                      onClick={() => handleSelectInvoice(invoice)}
                      className="w-full p-3 bg-secondary/30 rounded-lg border border-border hover:border-primary text-left transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{invoice.id}</span>
                        </div>
                        <Badge variant="secondary">${invoice.total}</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{invoice.customer}</span>
                        <span className="text-xs text-muted-foreground">{invoice.date}</span>
                      </div>
                    </button>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      No invoices found
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Selected Invoice */}
              <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedInvoice.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedInvoice.customer} • {selectedInvoice.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">Original: ${selectedInvoice.total}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs mt-1"
                      onClick={() => setSelectedInvoice(null)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Refund Amount */}
              <div className="space-y-2">
                <Label htmlFor="refund-amount">Refund Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="refund-amount"
                    type="number"
                    placeholder="0.00"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="pl-8"
                    min={0}
                    max={selectedInvoice.total}
                    step="0.01"
                  />
                </div>
                {parseFloat(refundAmount) > selectedInvoice.total && (
                  <p className="text-xs text-destructive">
                    Amount cannot exceed original total (${selectedInvoice.total})
                  </p>
                )}
              </div>

              {/* Refund Method */}
              <div className="space-y-2">
                <Label>Refund Method</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original Payment Method</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
                {paymentMethod === "cash" && !hasActiveDrawer && (
                  <p className="text-xs text-amber-600">
                    Warning: No active cash drawer. Refund won't be recorded to drawer.
                  </p>
                )}
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label>Reason for Refund</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REFUND_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {reason === "Other" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-reason">Specify Reason</Label>
                  <Textarea
                    id="custom-reason"
                    placeholder="Enter refund reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    maxLength={200}
                  />
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={handleSubmit}
                  disabled={!isValid}
                >
                  <RotateCcw className="h-4 w-4" />
                  Refund ${refundAmount || "0.00"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
