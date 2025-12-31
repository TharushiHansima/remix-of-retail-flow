import { ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface Transfer {
  id: string;
  transferNumber: string;
  fromBranch: string;
  toBranch: string;
  status: "pending" | "in_transit" | "received" | "cancelled";
  itemCount: number;
  totalQty: number;
  createdAt: Date;
  receivedAt?: Date;
  notes?: string;
}

interface ViewTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: Transfer | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  in_transit: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]",
  received: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_transit: "In Transit",
  received: "Received",
  cancelled: "Cancelled",
};

// Mock items for the transfer
const mockTransferItems = [
  { id: '1', productName: 'iPhone 15 Pro', sku: 'IPH-15-PRO', quantity: 10 },
  { id: '2', productName: 'Samsung S24 Ultra', sku: 'SAM-S24-ULT', quantity: 8 },
  { id: '3', productName: 'MacBook Air M3', sku: 'MAC-AIR-M3', quantity: 5 },
  { id: '4', productName: 'USB-C Charger', sku: 'USB-C-CHG', quantity: 2 },
];

export function ViewTransferDialog({ open, onOpenChange, transfer }: ViewTransferDialogProps) {
  if (!transfer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transfer Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transfer Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-lg font-bold">{transfer.transferNumber}</p>
              <p className="text-sm text-muted-foreground">
                Created {format(transfer.createdAt, 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            <Badge className={statusColors[transfer.status]}>
              {statusLabels[transfer.status]}
            </Badge>
          </div>

          <Separator />

          {/* Route */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Transfer Route</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 text-center">
                <p className="font-medium text-lg">{transfer.fromBranch}</p>
                <p className="text-sm text-muted-foreground">Source</p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="flex-1 text-center">
                <p className="font-medium text-lg">{transfer.toBranch}</p>
                <p className="text-sm text-muted-foreground">Destination</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="font-medium mb-3">Transfer Items</p>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTransferItems.slice(0, transfer.itemCount).map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{transfer.itemCount}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Quantity</p>
              <p className="text-2xl font-bold">{transfer.totalQty}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Created Date</p>
              <p className="font-medium">{format(transfer.createdAt, 'MMM d, yyyy')}</p>
            </div>
            {transfer.receivedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Received Date</p>
                <p className="font-medium">{format(transfer.receivedAt, 'MMM d, yyyy')}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {transfer.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="p-3 bg-muted/50 rounded-lg">{transfer.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
