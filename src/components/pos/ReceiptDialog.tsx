import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, Mail, Download, X } from "lucide-react";
import { format } from "date-fns";

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  serialNumber?: string;
}

interface ReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  customerName: string;
  invoiceNumber: string;
}

export function ReceiptDialog({
  open,
  onClose,
  cart,
  subtotal,
  discount,
  discountAmount,
  tax,
  total,
  paymentMethod,
  customerName,
  invoiceNumber,
}: ReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${invoiceNumber}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              padding: 20px;
              max-width: 300px;
              margin: 0 auto;
              font-size: 12px;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { font-size: 18px; margin: 0; }
            .header p { margin: 4px 0; color: #666; }
            .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 8px 0; }
            .item-name { flex: 1; }
            .item-qty { width: 40px; text-align: center; }
            .item-price { width: 60px; text-align: right; }
            .totals { margin-top: 10px; }
            .totals .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .totals .total { font-weight: bold; font-size: 14px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #666; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleEmail = () => {
    // Placeholder for email functionality
    alert("Email receipt functionality would be implemented here");
  };

  const handleDownload = () => {
    const content = receiptRef.current?.innerText || "";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Receipt Preview
          </DialogTitle>
        </DialogHeader>

        <div
          ref={receiptRef}
          className="bg-card border border-border rounded-lg p-4 font-mono text-sm max-h-96 overflow-auto"
        >
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-lg font-bold">DevLab Store</h1>
            <p className="text-xs text-muted-foreground">123 Business Street</p>
            <p className="text-xs text-muted-foreground">Tel: (555) 123-4567</p>
          </div>

          <Separator className="my-3" />

          {/* Invoice Details */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice:</span>
              <span className="font-medium">{invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{format(new Date(), "dd/MM/yyyy HH:mm")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer:</span>
              <span>{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment:</span>
              <span className="capitalize">{paymentMethod}</span>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Items */}
          <div className="space-y-2">
            <div className="flex text-xs text-muted-foreground font-medium">
              <span className="flex-1">Item</span>
              <span className="w-10 text-center">Qty</span>
              <span className="w-16 text-right">Price</span>
            </div>
            {cart.map((item) => (
              <div key={item.id} className="text-xs">
                <div className="flex">
                  <span className="flex-1 truncate">{item.name}</span>
                  <span className="w-10 text-center">{item.quantity}</span>
                  <span className="w-16 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                {item.serialNumber && (
                  <p className="text-muted-foreground text-[10px] pl-2">S/N: {item.serialNumber}</p>
                )}
              </div>
            ))}
          </div>

          <Separator className="my-3" />

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[hsl(var(--success))]">
                <span>Discount ({discount}%):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-base">
              <span>TOTAL:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Thank you for your purchase!</p>
            <p>Please keep this receipt for your records.</p>
            <p className="mt-2">Returns accepted within 14 days</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="flex-1 gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleEmail} variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
          </Button>
          <Button onClick={handleDownload} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
