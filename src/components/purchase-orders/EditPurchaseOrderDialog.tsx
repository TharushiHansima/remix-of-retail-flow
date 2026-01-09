import { useState, useEffect, useMemo } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

// ✅ backend
import { listProducts } from "@/features/inventory/products/products.api";
import type { Product as ApiProduct } from "@/features/inventory/products/products.types";
import { getPurchaseOrder, updatePurchaseOrder } from "@/features/procurement/purchase-orders/purchase-orders.api";
import type { PurchaseOrder as ApiPurchaseOrder } from "@/features/procurement/purchase-orders/purchase-orders.types";
import { listSuppliers } from "@/features/procurement/suppliers/suppliers.api";
import type { Supplier } from "@/features/procurement/suppliers/suppliers.types";

const formSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  expectedDelivery: z.date({ required_error: "Expected delivery date is required" }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  supplierId?: string;
  branchId?: string;
  orderDate: string;
  expectedDate: string;
  items: number;
  totalValue: number;
  status: "draft" | "pending" | "approved" | "shipped" | "received" | "partial";
  lineItems?: ApiPurchaseOrder["items"];
}

interface LineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

type ApiSupplier = Supplier;

function toNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function toValidDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function normalizeProducts(res: any): ApiProduct[] {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.items && Array.isArray(res.items)) return res.items;
  return [];
}

interface EditPurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PurchaseOrder | null;
}

export function EditPurchaseOrderDialog({
  open,
  onOpenChange,
  order,
}: EditPurchaseOrderDialogProps) {
  const { toast } = useToast();

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: "",
      notes: "",
    },
  });

  const activeSuppliers = useMemo(
    () => suppliers.filter((s) => s.isActive !== false),
    [suppliers],
  );

  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive !== false),
    [products],
  );

  // ✅ Load suppliers + products + purchase order detail when dialog opens
  useEffect(() => {
    let alive = true;
    if (!open || !order?.id) return;

    void (async () => {
      try {
        setLoading(true);

        // Suppliers
        setLoadingSuppliers(true);
        const s = await listSuppliers();
        if (!alive) return;
        setSuppliers(Array.isArray(s) ? s : []);
        setLoadingSuppliers(false);

        // Products
        setLoadingProducts(true);
        const pRes = await listProducts({ page: 1, pageSize: 500, isActive: true });
        const pItems = normalizeProducts(pRes);
        if (!alive) return;
        setProducts(pItems);
        setLoadingProducts(false);

        if (order?.lineItems && order.lineItems.length > 0) {
          const expectedDate = toValidDate(order.expectedDate) ?? new Date();
          form.reset({
            supplierId: order.supplierId ?? "",
            expectedDelivery: expectedDate,
            notes: "",
          });

          const items = order.lineItems.map((it) => ({
            productId: it.productId,
            productName:
              it.product?.name ||
              (it as { productName?: string }).productName ||
              pItems.find((pp) => pp.id === it.productId)?.name ||
              "Unknown product",
            quantity: Number(it.quantity ?? 0),
            unitCost: toNumber(it.unitCost),
          }));

          setLineItems(items);
          return;
        }

        // PO detail
        const detail = await getPurchaseOrder(order.id);
        if (!alive) return;

        const supplierId = detail?.supplierId || detail?.supplier?.id || "";

        const expected = detail?.expectedDate || order.expectedDate;
        const expectedDate = toValidDate(expected) ?? new Date();

        form.reset({
          supplierId,
          expectedDelivery: expectedDate,
          notes: detail?.notes ?? "",
        });

        const items = (detail?.items ?? []).map((it) => ({
          productId: it.productId,
          productName:
            it.product?.name ||
            (it as { productName?: string }).productName ||
            pItems.find((pp) => pp.id === it.productId)?.name ||
            "Unknown product",
          quantity: Number(it.quantity ?? 0),
          unitCost: toNumber(it.unitCost),
        }));

        setLineItems(items);
      } catch (e: any) {
        toast({
          title: "Error",
          description: e?.message || "Failed to load purchase order",
          variant: "destructive",
        });
        const fallbackItems = (order?.lineItems ?? []).map((it) => ({
          productId: it.productId,
          productName:
            it.product?.name ||
            (it as { productName?: string }).productName ||
            "Unknown product",
          quantity: Number(it.quantity ?? 0),
          unitCost: toNumber(it.unitCost),
        }));

        const expectedDate = toValidDate(order?.expectedDate) ?? new Date();
        form.reset({
          supplierId: order?.supplierId ?? "",
          expectedDelivery: expectedDate,
          notes: "",
        });

        setLineItems(fallbackItems);
      } finally {
        if (alive) {
          setLoading(false);
          setLoadingSuppliers(false);
          setLoadingProducts(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, order?.id, order?.expectedDate, form, toast]);

  const addLineItem = () => {
    if (!selectedProduct) return;

    const product = activeProducts.find((p) => p.id === selectedProduct);
    if (!product) return;

    const unitCost = toNumber(product.costPrice ?? 0);

    const existingItem = lineItems.find((item) => item.productId === selectedProduct);
    if (existingItem) {
      setLineItems(
        lineItems.map((item) =>
          item.productId === selectedProduct
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        ),
      );
    } else {
      setLineItems([
        ...lineItems,
        {
          productId: selectedProduct,
          productName: product.name,
          quantity,
          unitCost,
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
  };

  const removeLineItem = (productId: string) => {
    setLineItems(lineItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setLineItems(
      lineItems.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const totalValue = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0,
  );

  const onSubmit = async (values: FormValues) => {
    if (!order?.id) return;

    if (lineItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
      return;
    }

    try {
      await updatePurchaseOrder(order.id, {
        supplierId: values.supplierId,
        expectedDate: values.expectedDelivery.toISOString(),
        notes: values.notes,
        items: lineItems.map((x) => ({
          productId: x.productId,
          quantity: x.quantity,
          unitCost: x.unitCost,
          taxRate: 0,
        })),
      });

      toast({
        title: "Purchase Order Updated",
        description: `${order.poNumber} has been updated successfully`,
      });

      // let list page refresh if it listens
      window.dispatchEvent(new Event("purchase-orders:changed"));

      onOpenChange(false);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to update purchase order",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setLineItems([]);
    onOpenChange(false);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? handleClose() : undefined)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Purchase Order - {order.poNumber}</DialogTitle>
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
                            placeholder={loadingSuppliers ? "Loading suppliers..." : "Select supplier"}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingSuppliers ? (
                          <SelectItem value="__loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : activeSuppliers.length === 0 ? (
                          <SelectItem value="__empty" disabled>
                            No suppliers found
                          </SelectItem>
                        ) : (
                          activeSuppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
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
                              !field.value && "text-muted-foreground",
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
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="flex-1">
                    <SelectValue
                      placeholder={loadingProducts ? "Loading products..." : "Select product"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProducts ? (
                      <SelectItem value="__loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : activeProducts.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        No products found
                      </SelectItem>
                    ) : (
                      activeProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                          {product.sku ? ` (${product.sku})` : ""} - $
                          {toNumber(product.costPrice).toLocaleString()}
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
                <Button type="button" onClick={addLineItem} variant="secondary" disabled={loading}>
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
              <Button type="submit" disabled={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
