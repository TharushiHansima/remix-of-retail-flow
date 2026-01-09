import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ✅ backend helpers
import { listProducts } from "@/features/inventory/products/products.api";
import type { Product as ApiProduct } from "@/features/inventory/products/products.types";
import { createPurchaseOrder } from "@/features/procurement/purchase-orders/purchase-orders.api";
import { listSuppliers } from "@/features/procurement/suppliers/suppliers.api";
import type { Supplier } from "@/features/procurement/suppliers/suppliers.types";

const formSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  expectedDelivery: z.date({ required_error: "Expected delivery date is required" }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

function toNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function normalizeProducts(res: any): ApiProduct[] {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.items && Array.isArray(res.items)) return res.items;
  return [];
}

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePurchaseOrderDialog({
  open,
  onOpenChange,
}: CreatePurchaseOrderDialogProps) {
  const { toast } = useToast();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: "",
      notes: "",
    },
  });

  // ✅ Load suppliers + products when dialog opens
  useEffect(() => {
    let alive = true;
    if (!open) return;

    void (async () => {
      try {
        setSuppliersLoading(true);
        const s = await listSuppliers();
        if (!alive) return;
        setSuppliers(Array.isArray(s) ? s.filter(x => x.isActive !== false) : []);
      } catch (e: any) {
        if (!alive) return;
        setSuppliers([]);
        toast({
          title: "Error",
          description: e?.message || "Failed to load suppliers",
          variant: "destructive",
        });
      } finally {
        if (alive) setSuppliersLoading(false);
      }
    })();

    void (async () => {
      try {
        setProductsLoading(true);
        const res = await listProducts({ page: 1, pageSize: 500, isActive: true });
        const items = normalizeProducts(res);
        if (!alive) return;
        setProducts(items.filter(p => p.isActive !== false));
      } catch (e: any) {
        if (!alive) return;
        setProducts([]);
        toast({
          title: "Error",
          description: e?.message || "Failed to load products",
          variant: "destructive",
        });
      } finally {
        if (alive) setProductsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, toast]);

  const addLineItem = () => {
    if (!selectedProductId) return;

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const unitCost = toNumber(product.costPrice ?? 0);

    const existing = lineItems.find((x) => x.productId === selectedProductId);
    if (existing) {
      setLineItems(
        lineItems.map((x) =>
          x.productId === selectedProductId
            ? { ...x, quantity: x.quantity + quantity }
            : x
        )
      );
    } else {
      setLineItems([
        ...lineItems,
        {
          productId: selectedProductId,
          productName: product.name,
          quantity,
          unitCost,
        },
      ]);
    }

    setSelectedProductId("");
    setQuantity(1);
  };

  const removeLineItem = (productId: string) => {
    setLineItems(lineItems.filter((x) => x.productId !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setLineItems(
      lineItems.map((x) =>
        x.productId === productId ? { ...x, quantity: newQuantity } : x
      )
    );
  };

  const totalValue = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );

  const onSubmit = async (values: FormValues) => {
    const branchId = localStorage.getItem("erp.branchId") || "";

    if (!branchId) {
      toast({
        title: "Branch not selected",
        description: "Please select a branch from the top header and try again.",
        variant: "destructive",
      });
      return;
    }

    if (lineItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPurchaseOrder({
        supplierId: values.supplierId,
        branchId,
        expectedDate: values.expectedDelivery.toISOString(),
        notes: values.notes,
        items: lineItems.map((x) => ({
          productId: x.productId,
          quantity: x.quantity,
          unitCost: x.unitCost,
          taxRate: 0,
        })),
      });

      const supplier = suppliers.find((s) => s.id === values.supplierId);

      toast({
        title: "Purchase Order Created",
        description: `PO created for ${supplier?.name ?? "Supplier"} with ${lineItems.length} items`,
      });

      form.reset();
      setLineItems([]);
      window.dispatchEvent(new Event("purchase-orders:changed"));
      onOpenChange(false);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to create purchase order",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setLineItems([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Purchase Order</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Supplier and Date */}
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
                          <SelectValue
                            placeholder={suppliersLoading ? "Loading suppliers..." : "Select supplier"}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliersLoading ? (
                          <SelectItem value="__loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : suppliers.length === 0 ? (
                          <SelectItem value="__empty" disabled>
                            No suppliers found
                          </SelectItem>
                        ) : (
                          suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery</FormLabel>
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
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Add Items Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Order Items</h3>
              <div className="flex gap-2">
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue
                      placeholder={productsLoading ? "Loading products..." : "Select product"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {productsLoading ? (
                      <SelectItem value="__loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : products.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        No products found
                      </SelectItem>
                    ) : (
                      products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                          {p.sku ? ` (${p.sku})` : ""} - ${toNumber(p.costPrice).toLocaleString()}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-24"
                  placeholder="Qty"
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
                      <TableHead className="w-28 text-center">Quantity</TableHead>
                      <TableHead className="w-28 text-right">Unit Cost</TableHead>
                      <TableHead className="w-28 text-right">Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.productId, parseInt(e.target.value) || 1)
                            }
                            className="w-20 text-center mx-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.unitCost.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${(item.quantity * item.unitCost).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeLineItem(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ${totalValue.toLocaleString()}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes for this order..."
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
              <Button type="submit">Create Purchase Order</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
