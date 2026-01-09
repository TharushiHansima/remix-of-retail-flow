import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, CalendarIcon, Package } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

// ✅ use your backend api helper
import { api } from "@/lib/api";

const formSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  branchId: z.string().min(1, "Branch is required"),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.date().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface GRNLineItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: Date;
}

interface LandedCostItem {
  id: string;
  type: string;
  description: string;
  amount: number;
}

interface CreateGRNDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// --- Helpers to handle both array and {data: []} backend responses ---
function unwrapList<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

function unwrapId(res: any): string | null {
  if (!res) return null;
  if (typeof res.id === "string") return res.id;
  if (res.data && typeof res.data.id === "string") return res.data.id;
  return null;
}

function toISODate(d?: Date) {
  // backend usually accepts ISO string; safest
  return d ? d.toISOString() : undefined;
}

export function CreateGRNDialog({ open, onOpenChange }: CreateGRNDialogProps) {
  const { toast } = useToast();
  const [lineItems, setLineItems] = useState<GRNLineItem[]>([]);
  const [landedCosts, setLandedCosts] = useState<LandedCostItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);
  const [costType, setCostType] = useState("");
  const [costDescription, setCostDescription] = useState("");
  const [costAmount, setCostAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fetch suppliers from backend
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      // change endpoint if yours differs
      const res = await api<any>("/procurement/suppliers", { method: "GET", auth: true });
      const list = unwrapList<any>(res);

      // normalize shape: {id,name}
      return list
        .filter((s) => s?.isActive !== false) // keep if backend has isActive
        .map((s) => ({ id: s.id, name: s.name }));
    },
  });

  // ✅ Fetch branches from backend
  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      // change endpoint if yours differs
      const res = await api<any>("/inventory/branches", { method: "GET", auth: true });
      const list = unwrapList<any>(res);

      return list
        .filter((b) => b?.isActive !== false)
        .map((b) => ({ id: b.id, name: b.name }));
    },
  });

  // ✅ Fetch products from backend
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      // change endpoint if yours differs
      const res = await api<any>("/inventory/products", { method: "GET", auth: true });
      const list = unwrapList<any>(res);

      // normalize: id, name, sku, cost_price/costPrice
      return list
        .filter((p) => p?.isActive !== false)
        .map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku ?? p.code ?? "",
          cost_price: p.costPrice ?? p.cost_price ?? p.cost ?? 0,
        }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: "",
      branchId: "",
      invoiceNumber: "",
      notes: "",
    },
  });

  // Update unit cost when product changes
  useEffect(() => {
    if (selectedProduct) {
      const product = products.find((p) => p.id === selectedProduct);
      if (product) setUnitCost(Number(product.cost_price) || 0);
    }
  }, [selectedProduct, products]);

  const addLineItem = () => {
    if (!selectedProduct || quantity < 1) return;

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const existingItem = lineItems.find((item) => item.productId === selectedProduct);
    if (existingItem) {
      setLineItems(
        lineItems.map((item) =>
          item.productId === selectedProduct
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setLineItems([
        ...lineItems,
        {
          id: crypto.randomUUID(),
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          quantity,
          unitCost,
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
    setUnitCost(0);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (
    id: string,
    field: keyof GRNLineItem,
    value: number | string | Date
  ) => {
    setLineItems(lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addLandedCost = () => {
    if (!costType || costAmount <= 0) return;

    setLandedCosts([
      ...landedCosts,
      {
        id: crypto.randomUUID(),
        type: costType,
        description: costDescription,
        amount: costAmount,
      },
    ]);

    setCostType("");
    setCostDescription("");
    setCostAmount(0);
  };

  const removeLandedCost = (id: string) => {
    setLandedCosts(landedCosts.filter((cost) => cost.id !== id));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const totalLandedCost = landedCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const totalAmount = subtotal + totalLandedCost;

  const onSubmit = async (values: FormValues) => {
    if (lineItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // ✅ Create GRN in backend
      // IMPORTANT: If your backend CreateGrnDto REQUIRES poId, this will 400/500.
      // If that happens, tell me your backend CreateGrnDto and I'll map exactly.
      const payload: any = {
        supplierId: values.supplierId,
        branchId: values.branchId,
        invoiceNumber: values.invoiceNumber || undefined,
        invoiceDate: values.invoiceDate ? toISODate(values.invoiceDate) : undefined,
        notes: values.notes || undefined,
        items: lineItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          batchNumber: item.batchNumber || undefined,
          expiryDate: item.expiryDate ? toISODate(item.expiryDate) : undefined,
        })),
      };

      const created = await api<any>("/procurement/grns", {
        method: "POST",
        auth: true,
        json: payload,
      });

      const grnId = unwrapId(created);
      if (!grnId) {
        throw new Error("GRN created but no id returned from backend");
      }

      // ✅ Add landed costs (your backend uses POST /:id/landed-costs)
      if (landedCosts.length > 0) {
        for (const cost of landedCosts) {
          await api<any>(`/procurement/grns/${grnId}/landed-costs`, {
            method: "POST",
            auth: true,
            json: {
              type: cost.type,
              description: cost.description || undefined,
              amount: cost.amount,
            },
          });
        }
      }

      toast({
        title: "GRN Created",
        description: "GRN has been created successfully",
      });

      handleClose();
    } catch (error: any) {
      console.error("Error creating GRN:", error);

      const msg =
        error?.message ||
        error?.error ||
        (typeof error === "string" ? error : null) ||
        "Failed to create GRN. Please try again.";

      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setLineItems([]);
    setLandedCosts([]);
    setSelectedProduct("");
    setQuantity(1);
    setUnitCost(0);
    setCostType("");
    setCostDescription("");
    setCostAmount(0);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // keep behavior: close resets
        if (!nextOpen) handleClose();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Create New GRN</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Record goods received from suppliers
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Header Details */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier: any) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receiving Branch</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.map((branch: any) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Invoice #</FormLabel>
                    <FormControl>
                      <Input placeholder="INV-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Add Items Section */}
            <div className="space-y-3">
              <h3 className="font-medium">Received Items</h3>
              <div className="flex gap-2">
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product: any) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20"
                  placeholder="Qty"
                />

                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={unitCost}
                  onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                  className="w-28"
                  placeholder="Unit Cost"
                />

                <Button type="button" onClick={addLineItem} variant="secondary">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Items Table */}
            {lineItems.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="w-24 text-center">Qty</TableHead>
                      <TableHead className="w-28 text-right">Unit Cost</TableHead>
                      <TableHead className="w-28 text-right">Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {item.sku}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-20 text-center mx-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right">${item.unitCost.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${(item.quantity * item.unitCost).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeLineItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <Separator />

            {/* Landed Costs Section */}
            <div className="space-y-3">
              <h3 className="font-medium">Landed Costs</h3>
              <div className="flex gap-2">
                <Select value={costType} onValueChange={setCostType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Cost type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="customs">Customs</SelectItem>
                    <SelectItem value="handling">Handling</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={costDescription}
                  onChange={(e) => setCostDescription(e.target.value)}
                  className="flex-1"
                  placeholder="Description"
                />

                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={costAmount || ""}
                  onChange={(e) => setCostAmount(parseFloat(e.target.value) || 0)}
                  className="w-28"
                  placeholder="Amount"
                />

                <Button type="button" onClick={addLandedCost} variant="secondary">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {landedCosts.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {landedCosts.map((cost) => (
                        <TableRow key={cost.id}>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {cost.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{cost.description || "-"}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${cost.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeLandedCost(cost.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <Separator />

            {/* Summary */}
            <div className="flex justify-end">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Landed Costs</span>
                  <span>${totalLandedCost.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-lg">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this delivery..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                <Package className="h-4 w-4 mr-2" />
                {submitting ? "Creating..." : "Create GRN"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
