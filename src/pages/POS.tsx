import { useState } from "react";
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Pause,
  Printer,
  Mail,
  User,
  Percent,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  serialNumber?: string;
}

const sampleProducts = [
  { id: "1", name: "iPhone 15 Pro Max 256GB", sku: "APL-IP15PM-256", price: 1199, stock: 5 },
  { id: "2", name: "Samsung Galaxy S24 Ultra", sku: "SAM-S24U-256", price: 1099, stock: 8 },
  { id: "3", name: "MacBook Pro 14\" M3", sku: "APL-MBP14-M3", price: 1999, stock: 3 },
  { id: "4", name: "AirPods Pro 2nd Gen", sku: "APL-APP2", price: 249, stock: 15 },
  { id: "5", name: "USB-C Fast Charger 65W", sku: "ACC-USBC-65W", price: 45, stock: 25 },
  { id: "6", name: "Screen Protector Premium", sku: "ACC-SP-PREM", price: 29, stock: 50 },
];

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([
    { id: "1", name: "iPhone 15 Pro Max 256GB", sku: "APL-IP15PM-256", price: 1199, quantity: 1, serialNumber: "SN-12345678" },
    { id: "4", name: "AirPods Pro 2nd Gen", sku: "APL-APP2", price: 249, quantity: 2 },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [discount, setDiscount] = useState(0);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * (discount / 100);
  const tax = (subtotal - discountAmount) * 0.1;
  const total = subtotal - discountAmount + tax;

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const addToCart = (product: typeof sampleProducts[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const filteredProducts = sampleProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-7rem)]">
      {/* Left Panel - Product Search & Cart */}
      <div className="flex-1 flex flex-col bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name, SKU, or scan barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Barcode className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-auto p-4">
          {searchQuery ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="p-4 bg-secondary/50 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-left"
                >
                  <p className="font-medium text-sm text-card-foreground line-clamp-2">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{product.sku}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-primary">${product.price}</p>
                    <Badge variant="secondary">{product.stock} in stock</Badge>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Search for products to add to cart</p>
                <p className="text-sm">or scan a barcode</p>
              </div>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="border-t border-border">
          <div className="p-4">
            <h3 className="font-semibold text-card-foreground mb-3">Cart Items ({cart.length})</h3>
            <div className="space-y-3 max-h-48 overflow-auto">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-card-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                    {item.serialNumber && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        S/N: {item.serialNumber}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-semibold text-card-foreground w-20 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Bill Summary */}
      <div className="w-96 flex flex-col bg-card rounded-lg border border-border shadow-sm">
        {/* Offline Indicator */}
        <div className="p-3 bg-[hsl(var(--warning))]/10 border-b border-border flex items-center gap-2 text-[hsl(var(--warning))]">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Demo Mode</span>
        </div>

        {/* Customer Selection */}
        <div className="p-4 border-b border-border">
          <Button variant="outline" className="w-full justify-start gap-2">
            <User className="h-4 w-4" />
            <span>Walk-in Customer</span>
          </Button>
        </div>

        {/* Bill Summary */}
        <div className="flex-1 p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Discount %"
                  value={discount || ""}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="pl-10"
                />
              </div>
              {discount > 0 && (
                <span className="text-sm text-[hsl(var(--success))] font-medium">
                  -${discountAmount.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-4 border-t border-border space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="flex-col gap-1 h-auto py-3">
              <Banknote className="h-5 w-5" />
              <span className="text-xs">Cash</span>
            </Button>
            <Button variant="outline" className="flex-col gap-1 h-auto py-3">
              <CreditCard className="h-5 w-5" />
              <span className="text-xs">Card</span>
            </Button>
            <Button variant="outline" className="flex-col gap-1 h-auto py-3">
              <Smartphone className="h-5 w-5" />
              <span className="text-xs">Mobile</span>
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-border space-y-3">
          <Button className="w-full" size="lg">
            Complete Sale
          </Button>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Pause className="h-4 w-4" />
              Hold
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
