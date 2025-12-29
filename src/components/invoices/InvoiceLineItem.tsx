import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import type { Product } from "@/hooks/useInvoiceData";

export interface LineItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_percent: number;
  total: number;
}

interface InvoiceLineItemProps {
  item: LineItem;
  products: Product[];
  taxRate: number;
  onUpdate: (id: string, updates: Partial<LineItem>) => void;
  onRemove: (id: string) => void;
}

export function InvoiceLineItem({ item, products, taxRate, onUpdate, onRemove }: InvoiceLineItemProps) {
  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const quantity = item.quantity || 1;
      const subtotal = product.unit_price * quantity;
      const discountAmount = subtotal * (item.discount_percent / 100);
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = taxableAmount * (taxRate / 100);
      const total = taxableAmount + taxAmount;

      onUpdate(item.id, {
        product_id: productId,
        product_name: product.name,
        sku: product.sku,
        unit_price: product.unit_price,
        tax_percent: taxRate,
        total,
      });
    }
  };

  const recalculateTotal = (quantity: number, unitPrice: number, discountPercent: number) => {
    const subtotal = unitPrice * quantity;
    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    return taxableAmount + taxAmount;
  };

  const handleQuantityChange = (value: string) => {
    const quantity = Math.max(1, parseInt(value) || 1);
    const total = recalculateTotal(quantity, item.unit_price, item.discount_percent);
    onUpdate(item.id, { quantity, total });
  };

  const handlePriceChange = (value: string) => {
    const unitPrice = Math.max(0, parseFloat(value) || 0);
    const total = recalculateTotal(item.quantity, unitPrice, item.discount_percent);
    onUpdate(item.id, { unit_price: unitPrice, total });
  };

  const handleDiscountChange = (value: string) => {
    const discountPercent = Math.min(100, Math.max(0, parseFloat(value) || 0));
    const total = recalculateTotal(item.quantity, item.unit_price, discountPercent);
    onUpdate(item.id, { discount_percent: discountPercent, total });
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-center py-2 border-b border-border last:border-0">
      <div className="col-span-4">
        <Select value={item.product_id} onValueChange={handleProductChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent className="bg-popover max-h-60">
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                <span className="font-medium">{product.name}</span>
                <span className="text-muted-foreground ml-2 text-xs">{product.sku}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
          className="text-center"
        />
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={item.unit_price}
          onChange={(e) => handlePriceChange(e.target.value)}
          className="text-right"
        />
      </div>
      <div className="col-span-1">
        <Input
          type="number"
          min="0"
          max="100"
          value={item.discount_percent}
          onChange={(e) => handleDiscountChange(e.target.value)}
          className="text-center"
        />
      </div>
      <div className="col-span-2 text-right font-medium">
        ${item.total.toFixed(2)}
      </div>
      <div className="col-span-1 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
