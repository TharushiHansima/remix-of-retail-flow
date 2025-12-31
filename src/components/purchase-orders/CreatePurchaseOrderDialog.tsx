import { useState } from "react";
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

const formSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  expectedDelivery: z.date({ required_error: "Expected delivery date is required" }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LineItem {
  id: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

// Mock data - in real app this would come from database
const mockSuppliers = [
  { id: "1", name: "Apple Inc." },
  { id: "2", name: "Samsung Electronics" },
  { id: "3", name: "Generic Accessories Ltd" },
  { id: "4", name: "Tech Distributors Inc" },
  { id: "5", name: "Mobile Accessories Co" },
];

const mockProducts = [
  { id: "1", name: "iPhone 15 Pro", sku: "IP15P-256", unitCost: 999 },
  { id: "2", name: "Samsung Galaxy S24", sku: "SGS24-128", unitCost: 799 },
  { id: "3", name: "USB-C Cable", sku: "ACC-USBC", unitCost: 15 },
  { id: "4", name: "Phone Case", sku: "ACC-CASE", unitCost: 25 },
  { id: "5", name: "Screen Protector", sku: "ACC-SCRN", unitCost: 10 },
];

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePurchaseOrderDialog({
  open,
  onOpenChange,
}: CreatePurchaseOrderDialogProps) {
  const { toast } = useToast();
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: "",
      notes: "",
    },
  });

  const addLineItem = () => {
    if (!selectedProduct) return;

    const product = mockProducts.find((p) => p.id === selectedProduct);
    if (!product) return;

    const existingItem = lineItems.find((item) => item.id === selectedProduct);
    if (existingItem) {
      setLineItems(
        lineItems.map((item) =>
          item.id === selectedProduct
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setLineItems([
        ...lineItems,
        {
          id: selectedProduct,
          productName: product.name,
          quantity,
          unitCost: product.unitCost,
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const totalValue = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );

  const onSubmit = (values: FormValues) => {
    if (lineItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
      return;
    }

    const supplier = mockSuppliers.find((s) => s.id === values.supplierId);
    
    // In a real app, this would save to the database
    console.log("Creating PO:", {
      supplier: supplier?.name,
      expectedDelivery: values.expectedDelivery,
      notes: values.notes,
      items: lineItems,
      totalValue,
    });

    toast({
      title: "Purchase Order Created",
      description: `PO created for ${supplier?.name} with ${lineItems.length} items`,
    });

    // Reset form
    form.reset();
    setLineItems([]);
    onOpenChange(false);
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
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockSuppliers.map((supplier) => (
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
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - ${product.unitCost}
                      </SelectItem>
                    ))}
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
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, parseInt(e.target.value) || 1)
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
                            onClick={() => removeLineItem(item.id)}
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
