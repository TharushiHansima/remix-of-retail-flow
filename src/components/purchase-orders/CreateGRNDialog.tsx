import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Package } from "lucide-react";
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
import { http } from "@/lib/http";

const formSchema = z.object({
  invoiceNumber: z.string().optional(),
  invoiceDate: z.date().optional(),
  branchId: z.string().min(1, "Branch is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  items: number;
  totalValue: number;
  status: "draft" | "pending" | "approved" | "shipped" | "received" | "partial";
}

type ApiBranch = { id: string; name: string; isActive?: boolean };

type ApiPurchaseOrderDetail = {
  id: string;
  poNumber?: string;
  supplier?: { id: string; name: string } | null;
  branchId?: string | null;
  items?: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitCost: number | string;
    receivedQty?: number | string | null; // optional if backend provides
    receivedQuantity?: number | string | null; // optional alt key
    product?: { id: string; name: string; sku?: string | null } | null;
  }>;
};

interface GRNLineItem {
  id: string; // PO item id
  productId: string;
  product: string;
  sku: string;
  orderedQty: number;
  receivedQty: number;
  pendingQty: number;
  receivingQty: number;
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

interface CreateGRNDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PurchaseOrder | null;
}

export function CreateGRNDialog({ open, onOpenChange, order }: CreateGRNDialogProps) {
  const { toast } = useToast();

  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [lineItems, setLineItems] = useState<GRNLineItem[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceNumber: "",
      branchId: "",
      notes: "",
    },
  });

  const activeBranches = useMemo(
    () => branches.filter((b) => b.isActive !== false),
    [branches],
  );

  // ✅ Load branches + PO items when dialog opens
  useEffect(() => {
    let alive = true;
    if (!open || !order?.id) return;

    void (async () => {
      try {
        setLoading(true);

        // 1) Branches
        // If your backend route is different, update here.
        // Common options: /inventory/branches, /branches, /org/branches
        let br: ApiBranch[] | null = null;
        try {
          br = await http<ApiBranch[]>("/branches", { method: "GET", auth: true });
        } catch {
          try {
            br = await http<ApiBranch[]>("/inventory/branches", { method: "GET", auth: true });
          } catch {
            br = [];
          }
        }
        if (!alive) return;
        setBranches(Array.isArray(br) ? br : []);

        // preselect branch from header/localStorage if available
        const savedBranchId = localStorage.getItem("erp.branchId") || "";
        if (savedBranchId) {
          form.setValue("branchId", savedBranchId);
        }

        // 2) PO detail (items)
        const detail = await http<ApiPurchaseOrderDetail>(
          `/procurement/purchase-orders/${order.id}`,
          { method: "GET", auth: true },
        );
        if (!alive) return;

        const items: GRNLineItem[] = (detail?.items ?? []).map((it) => {
          const orderedQty = Number(it.quantity ?? 0);
          const receivedQty =
            toNumber(it.receivedQty ?? it.receivedQuantity ?? 0); // backend may not provide -> 0
          const pendingQty = Math.max(0, orderedQty - receivedQty);
          const unitCost = toNumber(it.unitCost);

          return {
            id: it.id,
            productId: it.productId,
            product: it.product?.name ?? "Unknown product",
            sku: it.product?.sku ?? "-",
            orderedQty,
            receivedQty,
            pendingQty,
            receivingQty: pendingQty, // default receive all pending
            unitCost,
          };
        });

        setLineItems(items);

        // if backend provides branchId in PO, prefer it if no saved branch
        const poBranchId = detail?.branchId ?? "";
        if (!savedBranchId && poBranchId) {
          form.setValue("branchId", poBranchId);
        }
      } catch (e: any) {
        toast({
          title: "Error",
          description: e?.message || "Failed to load GRN data",
          variant: "destructive",
        });
        setLineItems([]);
        setBranches([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, order?.id, form, toast]);

  const updateReceivingQty = (id: string, qty: number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, Math.min(qty, item.pendingQty));
          return { ...item, receivingQty: newQty };
        }
        return item;
      }),
    );
  };

  const totalReceiving = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.receivingQty * item.unitCost, 0),
    [lineItems],
  );

  const onSubmit = async (values: FormValues) => {
    if (!order?.id) return;

    const itemsToReceive = lineItems
      .filter((item) => item.receivingQty > 0)
      .map((item) => ({
        productId: item.productId,
        quantity: item.receivingQty,
        unitCost: item.unitCost,
      }));

    if (itemsToReceive.length === 0) {
      toast({
        title: "Error",
        description: "Please enter quantity for at least one item",
        variant: "destructive",
      });
      return;
    }

    try {
      await http("/procurement/grns", {
        method: "POST",
        auth: true,
        json: {
          purchaseOrderId: order.id,
          branchId: values.branchId,
          supplierInvoiceNo: values.invoiceNumber || null,
          supplierInvoiceDate: values.invoiceDate ? values.invoiceDate.toISOString() : null,
          notes: values.notes,
          items: itemsToReceive,
        },
      });

      toast({
        title: "GRN Created",
        description: `Goods received for ${order.poNumber}`,
      });

      // Let other pages refresh if they want
      window.dispatchEvent(new Event("grns:changed"));
      window.dispatchEvent(new Event("purchase-orders:changed"));

      form.reset();
      setLineItems([]);
      onOpenChange(false);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to create GRN",
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Create Goods Received Note</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Receiving items for {order.poNumber} from {order.supplier}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* GRN Details */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receiving Branch</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loading ? "Loading..." : "Select branch"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="__loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : activeBranches.length === 0 ? (
                          <SelectItem value="__empty" disabled>
                            No branches found
                          </SelectItem>
                        ) : (
                          activeBranches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Items to Receive */}
            <div className="space-y-3">
              <h3 className="font-medium">Items to Receive</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-center">Ordered</TableHead>
                      <TableHead className="text-center">Received</TableHead>
                      <TableHead className="text-center">Pending</TableHead>
                      <TableHead className="text-center w-28">Receiving</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8}>Loading...</TableCell>
                      </TableRow>
                    ) : lineItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8}>No items</TableCell>
                      </TableRow>
                    ) : (
                      lineItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.product}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {item.sku}
                          </TableCell>
                          <TableCell className="text-center">{item.orderedQty}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{item.receivedQty}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{item.pendingQty}</Badge>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={item.pendingQty}
                              value={item.receivingQty}
                              onChange={(e) =>
                                updateReceivingQty(item.id, parseInt(e.target.value) || 0)
                              }
                              className="w-20 text-center mx-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            ${item.unitCost.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${(item.receivingQty * item.unitCost).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {!loading && lineItems.length > 0 && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={7} className="text-right font-medium">
                          Total Value:
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ${totalReceiving.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
                      placeholder="Add any notes about the delivery..."
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
