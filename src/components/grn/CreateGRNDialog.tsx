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
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

  // Fetch suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
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

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, cost_price")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
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
      if (product) {
        setUnitCost(product.cost_price);
      }
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

  const updateLineItem = (id: string, field: keyof GRNLineItem, value: number | string | Date) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
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

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );

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

    try {
      // Generate GRN number
      const grnNumber = `GRN-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      // Create GRN
      const { data: grn, error: grnError } = await supabase
        .from("grn")
        .insert({
          grn_number: grnNumber,
          supplier_id: values.supplierId,
          branch_id: values.branchId,
          invoice_number: values.invoiceNumber || null,
          invoice_date: values.invoiceDate ? format(values.invoiceDate, "yyyy-MM-dd") : null,
          notes: values.notes || null,
          subtotal,
          landed_cost: totalLandedCost,
          total_amount: totalAmount,
          status: "pending",
        })
        .select()
        .single();

      if (grnError) throw grnError;

      // Insert GRN items
      const grnItems = lineItems.map((item) => ({
        grn_id: grn.id,
        product_id: item.productId,
        ordered_quantity: item.quantity,
        received_quantity: item.quantity,
        unit_cost: item.unitCost,
        batch_number: item.batchNumber || null,
        expiry_date: item.expiryDate ? format(item.expiryDate, "yyyy-MM-dd") : null,
      }));

      const { error: itemsError } = await supabase
        .from("grn_items")
        .insert(grnItems);

      if (itemsError) throw itemsError;

      // Insert landed costs if any
      if (landedCosts.length > 0) {
        const costs = landedCosts.map((cost) => ({
          grn_id: grn.id,
          cost_type: cost.type,
          description: cost.description || null,
          amount: cost.amount,
        }));

        const { error: costsError } = await supabase
          .from("grn_landed_costs")
          .insert(costs);

        if (costsError) throw costsError;
      }

      toast({
        title: "GRN Created",
        description: `${grnNumber} has been created successfully`,
      });

      handleClose();
    } catch (error) {
      console.error("Error creating GRN:", error);
      toast({
        title: "Error",
        description: "Failed to create GRN. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setLineItems([]);
    setLandedCosts([]);
    setSelectedProduct("");
    setQuantity(1);
    setUnitCost(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
                        {suppliers.map((supplier) => (
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
                        {branches.map((branch) => (
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
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
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
                    {products.map((product) => (
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
                              updateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)
                            }
                            className="w-20 text-center mx-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.unitCost.toFixed(2)}
                        </TableCell>
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
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                <Package className="h-4 w-4 mr-2" />
                Create GRN
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
