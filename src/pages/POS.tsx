import { useState, useEffect, useRef } from "react";
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
  ShoppingCart,
  History,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { BarcodeScannerDialog } from "@/components/pos/BarcodeScannerDialog";
import { ReceiptDialog } from "@/components/pos/ReceiptDialog";
import { CustomerSelectDialog } from "@/components/pos/CustomerSelectDialog";
import { PaymentDialog } from "@/components/pos/PaymentDialog";

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  serialNumber?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  creditLimit?: number;
  creditBalance?: number;
}

interface HeldOrder {
  id: string;
  cart: CartItem[];
  customer: Customer | null;
  discount: number;
  timestamp: Date;
}

const sampleProducts = [
  { id: "1", name: "iPhone 15 Pro Max 256GB", sku: "APL-IP15PM-256", price: 1199, stock: 5, barcode: "1234567890123" },
  { id: "2", name: "Samsung Galaxy S24 Ultra", sku: "SAM-S24U-256", price: 1099, stock: 8, barcode: "2345678901234" },
  { id: "3", name: "MacBook Pro 14\" M3", sku: "APL-MBP14-M3", price: 1999, stock: 3, barcode: "3456789012345" },
  { id: "4", name: "AirPods Pro 2nd Gen", sku: "APL-APP2", price: 249, stock: 15, barcode: "4567890123456" },
  { id: "5", name: "USB-C Fast Charger 65W", sku: "ACC-USBC-65W", price: 45, stock: 25, barcode: "5678901234567" },
  { id: "6", name: "Screen Protector Premium", sku: "ACC-SP-PREM", price: 29, stock: 50, barcode: "6789012345678" },
  { id: "7", name: "Wireless Mouse Pro", sku: "ACC-WM-PRO", price: 79, stock: 20, barcode: "7890123456789" },
  { id: "8", name: "Keyboard Mechanical RGB", sku: "ACC-KB-RGB", price: 149, stock: 12, barcode: "8901234567890" },
];

const sampleCustomers: Customer[] = [
  { id: "1", name: "John Smith", email: "john@example.com", phone: "555-0101", creditLimit: 5000, creditBalance: 1200 },
  { id: "2", name: "Jane Doe", email: "jane@example.com", phone: "555-0102", creditLimit: 3000, creditBalance: 500 },
  { id: "3", name: "Bob Wilson", email: "bob@example.com", phone: "555-0103" },
];

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [discount, setDiscount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  
  // Dialogs
  const [scannerOpen, setScannerOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [heldOrdersOpen, setHeldOrdersOpen] = useState(false);
  
  // Last completed sale for receipt
  const [lastSale, setLastSale] = useState<{
    cart: CartItem[];
    subtotal: number;
    discount: number;
    discountAmount: number;
    tax: number;
    total: number;
    paymentMethod: string;
    invoiceNumber: string;
  } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search on mount and keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        setScannerOpen(true);
      } else if (e.key === "F3") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        if (cart.length > 0) setPaymentOpen(true);
      } else if (e.key === "Escape") {
        setSearchQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart.length]);

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
    toast.success(`Added ${product.name}`);
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = sampleProducts.find(
      (p) => p.barcode === barcode || p.sku.toLowerCase() === barcode.toLowerCase()
    );
    if (product) {
      addToCart(product);
      setScannerOpen(false);
    } else {
      toast.error(`Product not found: ${barcode}`);
    }
  };

  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    
    const order: HeldOrder = {
      id: Date.now().toString(),
      cart: [...cart],
      customer: selectedCustomer,
      discount,
      timestamp: new Date(),
    };
    
    setHeldOrders((prev) => [...prev, order]);
    setCart([]);
    setDiscount(0);
    setSelectedCustomer(null);
    toast.success("Order held successfully");
  };

  const handleRecallOrder = (order: HeldOrder) => {
    setCart(order.cart);
    setSelectedCustomer(order.customer);
    setDiscount(order.discount);
    setHeldOrders((prev) => prev.filter((o) => o.id !== order.id));
    setHeldOrdersOpen(false);
    toast.success("Order recalled");
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscount(0);
    setSelectedCustomer(null);
  };

  const handlePaymentComplete = (method: string, amountPaid: number) => {
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
    
    setLastSale({
      cart: [...cart],
      subtotal,
      discount,
      discountAmount,
      tax,
      total,
      paymentMethod: method,
      invoiceNumber,
    });
    
    setPaymentOpen(false);
    setReceiptOpen(true);
    setCart([]);
    setDiscount(0);
    setSelectedCustomer(null);
    
    toast.success("Sale completed successfully!");
  };

  const filteredProducts = sampleProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery)
  );

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      {/* Left Panel - Product Search & Cart */}
      <div className="flex-1 flex flex-col bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search products or scan barcode... (F3)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setScannerOpen(true)} title="Barcode Scanner (F2)">
              <Barcode className="h-4 w-4" />
            </Button>
            {heldOrders.length > 0 && (
              <Button variant="outline" size="icon" onClick={() => setHeldOrdersOpen(true)} className="relative">
                <History className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                  {heldOrders.length}
                </Badge>
              </Button>
            )}
          </div>
          
          {/* Keyboard Shortcuts Hint */}
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span>F2: Scanner</span>
            <span>F3: Search</span>
            <span>F4: Pay</span>
            <span>ESC: Clear Search</span>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-auto p-4">
          {searchQuery ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                    <Badge variant={product.stock > 5 ? "secondary" : "destructive"}>
                      {product.stock} in stock
                    </Badge>
                  </div>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No products found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {sampleProducts.map((product) => (
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
                    <Badge variant={product.stock > 5 ? "secondary" : "destructive"}>
                      {product.stock}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="border-t border-border">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
              </h3>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearCart} className="text-destructive hover:text-destructive">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-48 overflow-auto">
              {cart.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
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
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-semibold text-card-foreground w-20 text-right text-sm">
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Bill Summary */}
      <div className="w-80 flex flex-col bg-card rounded-lg border border-border shadow-sm">
        {/* Customer Selection */}
        <div className="p-4 border-b border-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => setCustomerOpen(true)}
          >
            <User className="h-4 w-4" />
            <span className="truncate">
              {selectedCustomer ? selectedCustomer.name : "Walk-in Customer"}
            </span>
          </Button>
          {selectedCustomer?.creditLimit && (
            <p className="text-xs text-muted-foreground mt-2">
              Credit Available: ${(selectedCustomer.creditLimit - (selectedCustomer.creditBalance || 0)).toFixed(2)}
            </p>
          )}
        </div>

        {/* Bill Summary */}
        <div className="flex-1 p-4 space-y-4 overflow-auto">
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
                  min={0}
                  max={100}
                />
              </div>
              {discount > 0 && (
                <span className="text-sm text-[hsl(var(--success))] font-medium whitespace-nowrap">
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

        {/* Quick Payment Methods */}
        <div className="p-4 border-t border-border space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Quick Payment</p>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              className="flex-col gap-1 h-auto py-3"
              onClick={() => cart.length > 0 && handlePaymentComplete("cash", total)}
              disabled={cart.length === 0}
            >
              <Banknote className="h-5 w-5" />
              <span className="text-xs">Cash</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex-col gap-1 h-auto py-3"
              onClick={() => cart.length > 0 && handlePaymentComplete("card", total)}
              disabled={cart.length === 0}
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-xs">Card</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex-col gap-1 h-auto py-3"
              onClick={() => cart.length > 0 && handlePaymentComplete("mobile", total)}
              disabled={cart.length === 0}
            >
              <Smartphone className="h-5 w-5" />
              <span className="text-xs">Mobile</span>
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-border space-y-3">
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={() => setPaymentOpen(true)}
            disabled={cart.length === 0}
          >
            <CheckCircle className="h-5 w-5" />
            Pay ${total.toFixed(2)} (F4)
          </Button>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={handleHoldOrder}
              disabled={cart.length === 0}
            >
              <Pause className="h-4 w-4" />
              Hold
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => lastSale && setReceiptOpen(true)}
              disabled={!lastSale}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="gap-1" disabled={!lastSale}>
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <BarcodeScannerDialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScan}
      />

      {lastSale && (
        <ReceiptDialog
          open={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          cart={lastSale.cart}
          subtotal={lastSale.subtotal}
          discount={lastSale.discount}
          discountAmount={lastSale.discountAmount}
          tax={lastSale.tax}
          total={lastSale.total}
          paymentMethod={lastSale.paymentMethod}
          customerName={selectedCustomer?.name || "Walk-in Customer"}
          invoiceNumber={lastSale.invoiceNumber}
        />
      )}

      <CustomerSelectDialog
        open={customerOpen}
        onClose={() => setCustomerOpen(false)}
        onSelect={setSelectedCustomer}
        customers={sampleCustomers}
      />

      <PaymentDialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onComplete={handlePaymentComplete}
        total={total}
      />

      {/* Held Orders Dialog */}
      {heldOrdersOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Held Orders ({heldOrders.length})</h3>
            <div className="space-y-3 max-h-64 overflow-auto">
              {heldOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => handleRecallOrder(order)}
                  className="w-full p-3 bg-secondary/30 rounded-lg border border-border hover:border-primary text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{order.customer?.name || "Walk-in"}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.cart.length} items • ${order.cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {new Date(order.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setHeldOrdersOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
