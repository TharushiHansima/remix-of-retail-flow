import { useRef } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface ServiceBill {
  id: string;
  billNumber: string;
  jobCardNumber: string;
  customer: string;
  phone: string;
  device: string;
  status: "draft" | "pending" | "paid" | "partial" | "overdue";
  laborCost: number;
  partsCost: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  createdAt: string;
}

interface PrintBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: ServiceBill | null;
}

export function PrintBillDialog({ open, onOpenChange, bill }: PrintBillDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Service Bill - ${bill?.billNumber}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .header p {
                margin: 5px 0;
                color: #666;
              }
              .bill-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
              }
              .bill-info div {
                flex: 1;
              }
              .label {
                font-size: 12px;
                color: #666;
                margin-bottom: 2px;
              }
              .value {
                font-size: 14px;
                font-weight: 500;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 10px;
                text-align: left;
              }
              th {
                background-color: #f5f5f5;
              }
              .text-right {
                text-align: right;
              }
              .totals {
                margin-left: auto;
                width: 300px;
              }
              .totals-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
              }
              .totals-row.total {
                font-weight: bold;
                font-size: 18px;
                border-top: 2px solid #333;
                border-bottom: none;
                padding-top: 12px;
              }
              .footer {
                margin-top: 40px;
                text-align: center;
                color: #666;
                font-size: 12px;
              }
              @media print {
                body { padding: 20px; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!bill) return null;

  const subtotal = bill.laborCost + bill.partsCost;
  const balance = bill.totalAmount - bill.paidAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Print Bill</DialogTitle>
          <DialogDescription>
            Preview and print the service bill
          </DialogDescription>
        </DialogHeader>

        <div className="border border-border rounded-lg p-6 bg-background" ref={printRef}>
          {/* Header */}
          <div className="header text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">SERVICE BILL</h1>
            <p className="text-muted-foreground">Your Company Name</p>
            <p className="text-sm text-muted-foreground">123 Business Street, City, State 12345</p>
            <p className="text-sm text-muted-foreground">Phone: (123) 456-7890</p>
          </div>

          <Separator className="my-4" />

          {/* Bill Info */}
          <div className="bill-info grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="label text-xs text-muted-foreground">Bill To:</div>
              <div className="value font-medium text-foreground">{bill.customer}</div>
              <div className="text-sm text-muted-foreground">{bill.phone}</div>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <div className="label text-xs text-muted-foreground">Bill Number</div>
                <div className="value font-medium text-foreground">{bill.billNumber}</div>
              </div>
              <div className="mb-2">
                <div className="label text-xs text-muted-foreground">Job Card</div>
                <div className="value font-medium text-foreground">{bill.jobCardNumber}</div>
              </div>
              <div className="mb-2">
                <div className="label text-xs text-muted-foreground">Date</div>
                <div className="value text-foreground">{bill.createdAt}</div>
              </div>
              <div>
                <div className="label text-xs text-muted-foreground">Due Date</div>
                <div className="value text-foreground">{bill.dueDate}</div>
              </div>
            </div>
          </div>

          {/* Device */}
          <div className="mb-6 p-3 bg-muted/50 rounded-lg">
            <div className="label text-xs text-muted-foreground">Device</div>
            <div className="value font-medium text-foreground">{bill.device}</div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-2 text-left text-sm font-medium">Description</th>
                <th className="border border-border p-2 text-right text-sm font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-2 text-sm text-foreground">Labor Charges</td>
                <td className="border border-border p-2 text-right text-sm text-foreground">${bill.laborCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-border p-2 text-sm text-foreground">Parts & Materials</td>
                <td className="border border-border p-2 text-right text-sm text-foreground">${bill.partsCost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals ml-auto max-w-xs">
            <div className="totals-row flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            {bill.discount > 0 && (
              <div className="totals-row flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-${bill.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="totals-row flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-foreground">${bill.tax.toFixed(2)}</span>
            </div>
            <div className="totals-row total flex justify-between py-3 border-t-2 border-foreground font-bold text-lg">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">${bill.totalAmount.toFixed(2)}</span>
            </div>
            {bill.paidAmount > 0 && (
              <>
                <div className="totals-row flex justify-between py-2">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="text-[hsl(var(--success))]">${bill.paidAmount.toFixed(2)}</span>
                </div>
                <div className="totals-row flex justify-between py-2">
                  <span className="font-medium text-foreground">Balance Due</span>
                  <span className="font-medium text-foreground">${balance.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="footer mt-8 text-center text-xs text-muted-foreground">
            <p>Thank you for your business!</p>
            <p>Payment is due within 15 days. Please make checks payable to Your Company Name.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
