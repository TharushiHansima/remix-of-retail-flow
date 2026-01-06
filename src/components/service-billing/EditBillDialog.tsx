import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface BillItem {
  id: string;
  description: string;
  type: "labor" | "parts";
  quantity: number;
  unitPrice: number;
}

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

interface EditBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: ServiceBill | null;
  onSave: (bill: ServiceBill) => void;
}

export function EditBillDialog({ open, onOpenChange, bill, onSave }: EditBillDialogProps) {
  const [jobCardNumber, setJobCardNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [device, setDevice] = useState("");
  const [status, setStatus] = useState<ServiceBill["status"]>("pending");
  const [notes, setNotes] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxRate, setTaxRate] = useState(10);
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<BillItem[]>([]);

  useEffect(() => {
    if (bill) {
      setJobCardNumber(bill.jobCardNumber);
      setCustomerName(bill.customer);
      setCustomerPhone(bill.phone);
      setDevice(bill.device);
      setStatus(bill.status);
      setDueDate(bill.dueDate);
      setItems([
        { id: "1", description: "Labor", type: "labor", quantity: 1, unitPrice: bill.laborCost },
        { id: "2", description: "Parts", type: "parts", quantity: 1, unitPrice: bill.partsCost },
      ]);
      // Calculate discount and tax percentages from amounts
      const subtotal = bill.laborCost + bill.partsCost;
      setDiscountPercent(subtotal > 0 ? (bill.discount / subtotal) * 100 : 0);
      const afterDiscount = subtotal - bill.discount;
      setTaxRate(afterDiscount > 0 ? (bill.tax / afterDiscount) * 100 : 10);
    }
  }, [bill]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: "", type: "parts", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof BillItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const laborCost = items
    .filter((item) => item.type === "labor")
    .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const partsCost = items
    .filter((item) => item.type === "parts")
    .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const subtotal = laborCost + partsCost;
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const grandTotal = taxableAmount + taxAmount;

  const handleSubmit = () => {
    if (!customerName || !device) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (bill) {
      onSave({
        ...bill,
        jobCardNumber,
        customer: customerName,
        phone: customerPhone,
        device,
        status,
        laborCost,
        partsCost,
        discount: discountAmount,
        tax: taxAmount,
        totalAmount: grandTotal,
        dueDate,
      });
    }
    toast.success("Bill updated successfully");
    onOpenChange(false);
  };

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Bill - {bill.billNumber}</DialogTitle>
          <DialogDescription>
            Update the service bill details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Job & Customer Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Job & Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobCardNumber">Job Card Number</Label>
                <Input
                  id="jobCardNumber"
                  value={jobCardNumber}
                  onChange={(e) => setJobCardNumber(e.target.value)}
                  placeholder="e.g., JC-2024-0001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as ServiceBill["status"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device">Device *</Label>
                <Input
                  id="device"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  placeholder="e.g., iPhone 15 Pro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Bill Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Bill Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 grid grid-cols-5 gap-2">
                    <div className="col-span-2">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      />
                    </div>
                    <Select
                      value={item.type}
                      onValueChange={(value) => updateItem(item.id, "type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="labor">Labor</SelectItem>
                        <SelectItem value="parts">Parts</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Discount & Tax */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min={0}
                max={100}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min={0}
                max={100}
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount ({discountPercent.toFixed(1)}%):</span>
                <span className="text-destructive">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({taxRate}%):</span>
              <span className="text-foreground">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-medium pt-2 border-t border-border">
              <span className="text-foreground">Grand Total:</span>
              <span className="text-foreground">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
