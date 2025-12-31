import { TrendingUp, TrendingDown, AlertTriangle, Package } from 'lucide-react';
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

interface Adjustment {
  id: string;
  adjustmentNumber: string;
  branch: string;
  type: "gain" | "loss" | "damage" | "theft" | "miscount";
  reason: string;
  status: "pending" | "approved" | "rejected";
  itemCount: number;
  totalChange: number;
  createdBy: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

interface ViewAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adjustment: Adjustment | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  approved: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  rejected: "bg-destructive/10 text-destructive",
};

const typeColors: Record<string, string> = {
  gain: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  loss: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  damage: "bg-destructive/10 text-destructive",
  theft: "bg-destructive/10 text-destructive",
  miscount: "bg-muted text-muted-foreground",
};

const typeIcons: Record<string, typeof TrendingUp> = {
  gain: TrendingUp,
  loss: TrendingDown,
  damage: AlertTriangle,
  theft: AlertTriangle,
  miscount: Package,
};

// Mock items for the adjustment
const mockAdjustmentItems = [
  { id: '1', productName: 'iPhone 15 Pro', sku: 'IPH-15-PRO', currentStock: 45, adjustment: -3, newStock: 42 },
  { id: '2', productName: 'Samsung S24 Ultra', sku: 'SAM-S24-ULT', currentStock: 32, adjustment: -2, newStock: 30 },
  { id: '3', productName: 'MacBook Air M3', sku: 'MAC-AIR-M3', currentStock: 12, adjustment: -3, newStock: 9 },
];

export function ViewAdjustmentDialog({ open, onOpenChange, adjustment }: ViewAdjustmentDialogProps) {
  if (!adjustment) return null;

  const TypeIcon = typeIcons[adjustment.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adjustment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Adjustment Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-lg font-bold">{adjustment.adjustmentNumber}</p>
              <p className="text-sm text-muted-foreground">
                Created {format(adjustment.createdAt, 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            <Badge className={statusColors[adjustment.status]}>
              {adjustment.status.charAt(0).toUpperCase() + adjustment.status.slice(1)}
            </Badge>
          </div>

          <Separator />

          {/* Type and Branch */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Adjustment Type</p>
              <Badge className={`${typeColors[adjustment.type]} gap-1`}>
                <TypeIcon className="h-4 w-4" />
                {adjustment.type.charAt(0).toUpperCase() + adjustment.type.slice(1)}
              </Badge>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Branch</p>
              <p className="font-medium">{adjustment.branch}</p>
            </div>
          </div>

          {/* Reason */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Reason</p>
            <p className="p-3 bg-muted/50 rounded-lg">{adjustment.reason}</p>
          </div>

          {/* Items */}
          <div>
            <p className="font-medium mb-3">Adjustment Items</p>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-center">Before</TableHead>
                    <TableHead className="text-center">Change</TableHead>
                    <TableHead className="text-center">After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAdjustmentItems.slice(0, adjustment.itemCount).map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell className="text-center">{item.currentStock}</TableCell>
                      <TableCell className="text-center">
                        <span className={item.adjustment >= 0 ? 'text-[hsl(var(--success))]' : 'text-destructive'}>
                          {item.adjustment >= 0 ? '+' : ''}{item.adjustment}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-medium">{item.newStock}</TableCell>
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
              <p className="text-2xl font-bold">{adjustment.itemCount}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Net Change</p>
              <p className={`text-2xl font-bold ${adjustment.totalChange >= 0 ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}>
                {adjustment.totalChange >= 0 ? '+' : ''}{adjustment.totalChange}
              </p>
            </div>
          </div>

          {/* Created / Approved By */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Created By</p>
              <p className="font-medium">{adjustment.createdBy}</p>
              <p className="text-sm text-muted-foreground">{format(adjustment.createdAt, 'MMM d, yyyy')}</p>
            </div>
            {adjustment.approvedBy && adjustment.approvedAt && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {adjustment.status === 'approved' ? 'Approved By' : 'Rejected By'}
                </p>
                <p className="font-medium">{adjustment.approvedBy}</p>
                <p className="text-sm text-muted-foreground">{format(adjustment.approvedAt, 'MMM d, yyyy')}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
