import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Save, X, Receipt, Loader2 } from "lucide-react";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { useConfig } from "@/contexts/ConfigContext";
import { useAuth } from "@/contexts/AuthContext";
import { InvoiceLineItem, type LineItem } from "./InvoiceLineItem";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateInvoiceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateInvoiceForm({ onSuccess, onCancel }: CreateInvoiceFormProps) {
  const { products, customers, branches, loading: dataLoading } = useInvoiceData();
  const { config, formatCurrency, isFeatureEnabled } = useConfig();
  const { user } = useAuth();
  
  const [saving, setSaving] = useState(false);
  const [customerId, setCustomerId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [invoiceType, setInvoiceType] = useState<string>("sale");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);

  // Tax rate from config
  const taxRate = isFeatureEnabled("vat_enabled") ? 10 : 0; // Default 10% tax

  // Auto-select first branch
  useEffect(() => {
    if (branches.length > 0 && !branchId) {
      setBranchId(branches[0].id);
    }
  }, [branches, branchId]);

  // Generate a unique line item ID
  const generateId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add new line item
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: generateId(),
        product_id: "",
        product_name: "",
        sku: "",
        quantity: 1,
        unit_price: 0,
        discount_percent: 0,
        tax_percent: taxRate,
        total: 0,
      },
    ]);
  };

  // Update line item
  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(items =>
      items.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Remove line item
  const removeLineItem = (id: string) => {
    setLineItems(items => items.filter(item => item.id !== id));
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => {
    return sum + item.unit_price * item.quantity;
  }, 0);

  const lineDiscounts = lineItems.reduce((sum, item) => {
    return sum + (item.unit_price * item.quantity * item.discount_percent) / 100;
  }, 0);

  const discountAmount = lineDiscounts + (subtotal - lineDiscounts) * (globalDiscount / 100);
  
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (taxRate / 100);
  const totalAmount = taxableAmount + taxAmount;

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const prefix = invoiceType === "quotation" 
      ? config.documentNumbering.quotation.prefix 
      : config.documentNumbering.invoice.prefix;
    const number = invoiceType === "quotation"
      ? config.documentNumbering.quotation.currentNumber
      : config.documentNumbering.invoice.currentNumber;
    const padLength = invoiceType === "quotation"
      ? config.documentNumbering.quotation.padLength
      : config.documentNumbering.invoice.padLength;
    return `${prefix}${String(number).padStart(padLength, "0")}`;
  };

  // Save invoice
  const handleSave = async () => {
    // Validation
    if (!branchId) {
      toast.error("Please select a branch");
      return;
    }
    if (lineItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }
    if (lineItems.some(item => !item.product_id)) {
      toast.error("Please select a product for all line items");
      return;
    }

    setSaving(true);
    try {
      const invoiceNumber = generateInvoiceNumber();

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          invoice_type: invoiceType,
          customer_id: customerId || null,
          branch_id: branchId,
          created_by: user?.id,
          subtotal: subtotal,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          paid_amount: 0,
          status: "draft",
          notes: notes || null,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create line items
      const invoiceItems = lineItems.map(item => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        tax_percent: item.tax_percent,
        total: item.total,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      toast.success(`Invoice ${invoiceNumber} created successfully`);
      onSuccess();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Create Invoice</h2>
            <p className="text-sm text-muted-foreground">Add items and customer details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || lineItems.length === 0}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Type</Label>
                  <Select value={invoiceType} onValueChange={setInvoiceType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="sale">Sale Invoice</SelectItem>
                      <SelectItem value="quotation">Quotation</SelectItem>
                      <SelectItem value="proforma">Proforma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select value={branchId} onValueChange={setBranchId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Customer (Optional)</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Walk-in customer" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="">Walk-in Customer</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                          {customer.phone && (
                            <span className="text-muted-foreground ml-2 text-xs">
                              {customer.phone}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Line Items</CardTitle>
              <Button size="sm" variant="outline" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
                <div className="col-span-4">Product</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-1 text-center">Disc %</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items */}
              <ScrollArea className="max-h-80">
                {lineItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No items added</p>
                    <p className="text-sm">Click "Add Item" to get started</p>
                  </div>
                ) : (
                  lineItems.map((item) => (
                    <InvoiceLineItem
                      key={item.id}
                      item={item}
                      products={products}
                      taxRate={taxRate}
                      onUpdate={updateLineItem}
                      onRemove={removeLineItem}
                    />
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add notes or special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Additional Discount (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={globalDiscount}
                  onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Line Discounts</span>
                  <span className="text-destructive">-{formatCurrency(lineDiscounts)}</span>
                </div>
                {globalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Additional Discount ({globalDiscount}%)</span>
                    <span className="text-destructive">
                      -{formatCurrency((subtotal - lineDiscounts) * (globalDiscount / 100))}
                    </span>
                  </div>
                )}
                {taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Customer Credit Info */}
              {customerId && (() => {
                const customer = customers.find(c => c.id === customerId);
                if (customer && customer.credit_limit) {
                  const availableCredit = (customer.credit_limit || 0) - (customer.credit_balance || 0);
                  return (
                    <>
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Credit Limit</span>
                          <span>{formatCurrency(customer.credit_limit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available Credit</span>
                          <span className={availableCredit < totalAmount ? "text-destructive" : "text-[hsl(var(--success))]"}>
                            {formatCurrency(availableCredit)}
                          </span>
                        </div>
                      </div>
                    </>
                  );
                }
                return null;
              })()}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span>{lineItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Qty</span>
                  <span>{lineItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
