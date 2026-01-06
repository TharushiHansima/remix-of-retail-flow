import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CreateSupplierInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InvoiceForm {
  supplier_id: string;
  invoice_number: string;
  invoice_date: Date;
  due_date: Date;
  subtotal: number;
  tax_amount: number;
  notes: string;
}

const emptyForm: InvoiceForm = {
  supplier_id: "",
  invoice_number: "",
  invoice_date: new Date(),
  due_date: addDays(new Date(), 30),
  subtotal: 0,
  tax_amount: 0,
  notes: "",
};

export function CreateSupplierInvoiceDialog({
  open,
  onOpenChange,
}: CreateSupplierInvoiceDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<InvoiceForm>(emptyForm);

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InvoiceForm) => {
      const totalAmount = data.subtotal + data.tax_amount;
      const { error } = await supabase.from("supplier_invoices").insert({
        supplier_id: data.supplier_id,
        invoice_number: data.invoice_number,
        invoice_date: format(data.invoice_date, "yyyy-MM-dd"),
        due_date: format(data.due_date, "yyyy-MM-dd"),
        subtotal: data.subtotal,
        tax_amount: data.tax_amount,
        total_amount: totalAmount,
        paid_amount: 0,
        status: "unpaid",
        notes: data.notes || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-invoices-aging"] });
      onOpenChange(false);
      setForm(emptyForm);
      toast.success("Supplier invoice created");
    },
    onError: (error) => {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create supplier invoice");
    },
  });

  const handleSubmit = () => {
    if (!form.supplier_id) {
      toast.error("Please select a supplier");
      return;
    }
    if (!form.invoice_number.trim()) {
      toast.error("Please enter an invoice number");
      return;
    }
    if (form.subtotal <= 0) {
      toast.error("Subtotal must be greater than 0");
      return;
    }
    createMutation.mutate(form);
  };

  const totalAmount = form.subtotal + form.tax_amount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Supplier Invoice</DialogTitle>
          <DialogDescription>
            Manually record a new supplier invoice for tracking payables.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Supplier *</Label>
            <Select
              value={form.supplier_id}
              onValueChange={(v) => setForm({ ...form, supplier_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Invoice Number *</Label>
            <Input
              placeholder="e.g. INV-001"
              value={form.invoice_number}
              onChange={(e) =>
                setForm({ ...form, invoice_number: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.invoice_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.invoice_date
                      ? format(form.invoice_date, "MMM d, yyyy")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.invoice_date}
                    onSelect={(date) =>
                      date && setForm({ ...form, invoice_date: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.due_date
                      ? format(form.due_date, "MMM d, yyyy")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.due_date}
                    onSelect={(date) =>
                      date && setForm({ ...form, due_date: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subtotal *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.subtotal || ""}
                onChange={(e) =>
                  setForm({ ...form, subtotal: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tax Amount</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.tax_amount || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tax_amount: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-between items-center py-2 px-3 bg-muted rounded-md">
            <span className="font-medium">Total Amount</span>
            <span className="text-lg font-bold">
              ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Additional notes about this invoice..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
