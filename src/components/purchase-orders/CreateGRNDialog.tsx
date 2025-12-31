import { useState } from "react";
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

interface GRNLineItem {
  id: string;
  product: string;
  sku: string;
  orderedQty: number;
  receivedQty: number;
  pendingQty: number;
  receivingQty: number;
  unitCost: number;
}

const mockBranches = [
  { id: "1", name: "Main Store" },
  { id: "2", name: "Downtown Branch" },
  { id: "3", name: "Mall Outlet" },
];

// Mock line items from the PO
const mockPOLineItems: GRNLineItem[] = [
  { id: "1", product: "iPhone 15 Pro 256GB", sku: "IP15P-256", orderedQty: 10, receivedQty: 0, pendingQty: 10, receivingQty: 10, unitCost: 999 },
  { id: "2", product: "USB-C Cable 2m", sku: "ACC-USBC-2M", orderedQty: 50, receivedQty: 0, pendingQty: 50, receivingQty: 50, unitCost: 15 },
  { id: "3", product: "Phone Case Clear", sku: "ACC-CASE-CLR", orderedQty: 100, receivedQty: 0, pendingQty: 100, receivingQty: 100, unitCost: 12 },
];

interface CreateGRNDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PurchaseOrder | null;
}

export function CreateGRNDialog({
  open,
  onOpenChange,
  order,
}: CreateGRNDialogProps) {
  const { toast } = useToast();
  const [lineItems, setLineItems] = useState<GRNLineItem[]>(mockPOLineItems);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceNumber: "",
      branchId: "",
      notes: "",
    },
  });

  const updateReceivingQty = (id: string, qty: number) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, Math.min(qty, item.pendingQty));
          return { ...item, receivingQty: newQty };
        }
        return item;
      })
    );
  };

  const totalReceiving = lineItems.reduce(
    (sum, item) => sum + item.receivingQty * item.unitCost,
    0
  );

  const onSubmit = (values: FormValues) => {
    const itemsToReceive = lineItems.filter((item) => item.receivingQty > 0);
    
    if (itemsToReceive.length === 0) {
      toast({
        title: "Error",
        description: "Please enter quantity for at least one item",
        variant: "destructive",
      });
      return;
    }

    console.log("Creating GRN:", {
      poNumber: order?.poNumber,
      supplier: order?.supplier,
      branch: mockBranches.find((b) => b.id === values.branchId)?.name,
      invoiceNumber: values.invoiceNumber,
      invoiceDate: values.invoiceDate,
      notes: values.notes,
      items: itemsToReceive,
      totalValue: totalReceiving,
    });

    toast({
      title: "GRN Created",
      description: `Goods received for ${order?.poNumber}`,
    });

    form.reset();
    setLineItems(mockPOLineItems);
    onOpenChange(false);
  };

  const handleClose = () => {
    form.reset();
    setLineItems(mockPOLineItems);
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
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockBranches.map((branch) => (
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
                    {lineItems.map((item) => (
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
                    ))}
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={7} className="text-right font-medium">
                        Total Value:
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ${totalReceiving.toLocaleString()}
                      </TableCell>
                    </TableRow>
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
