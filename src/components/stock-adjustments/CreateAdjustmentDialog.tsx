import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface AdjustmentItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  adjustmentQty: number;
}

interface CreateAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockProducts = [
  { id: '1', name: 'iPhone 15 Pro', sku: 'IPH-15-PRO', currentStock: 45 },
  { id: '2', name: 'Samsung S24 Ultra', sku: 'SAM-S24-ULT', currentStock: 32 },
  { id: '3', name: 'MacBook Air M3', sku: 'MAC-AIR-M3', currentStock: 12 },
  { id: '4', name: 'iPad Pro 12.9"', sku: 'IPAD-PRO-12', currentStock: 18 },
];

const mockBranches = [
  { id: '1', name: 'Main Branch' },
  { id: '2', name: 'Warehouse' },
  { id: '3', name: 'Downtown Store' },
];

const adjustmentTypes = [
  { id: 'gain', name: 'Gain', description: 'Stock increase' },
  { id: 'loss', name: 'Loss', description: 'Stock decrease' },
  { id: 'damage', name: 'Damage', description: 'Damaged goods' },
  { id: 'theft', name: 'Theft', description: 'Stolen items' },
  { id: 'miscount', name: 'Miscount', description: 'Inventory count correction' },
];

export function CreateAdjustmentDialog({ open, onOpenChange }: CreateAdjustmentDialogProps) {
  const [branch, setBranch] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('');
  const [reason, setReason] = useState('');
  const [items, setItems] = useState<AdjustmentItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');

  const handleAddItem = () => {
    if (!selectedProduct) return;
    const product = mockProducts.find(p => p.id === selectedProduct);
    if (!product) return;
    if (items.find(i => i.productId === selectedProduct)) {
      toast.error('Product already added');
      return;
    }
    setItems([...items, {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      currentStock: product.currentStock,
      adjustmentQty: adjustmentType === 'gain' ? 1 : -1,
    }]);
    setSelectedProduct('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleQuantityChange = (id: string, qty: number) => {
    const isNegative = adjustmentType !== 'gain';
    const absQty = Math.abs(qty);
    setItems(items.map(i => i.id === id ? { ...i, adjustmentQty: isNegative ? -absQty : absQty } : i));
  };

  const handleSubmit = () => {
    if (!branch) {
      toast.error('Please select a branch');
      return;
    }
    if (!adjustmentType) {
      toast.error('Please select an adjustment type');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    toast.success('Adjustment submitted for approval');
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setBranch('');
    setAdjustmentType('');
    setReason('');
    setItems([]);
    setSelectedProduct('');
  };

  const totalItems = items.length;
  const totalChange = items.reduce((sum, i) => sum + i.adjustmentQty, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Stock Adjustment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Branch and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Branch *</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {mockBranches.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Adjustment Type *</Label>
              <Select value={adjustmentType} onValueChange={(v) => {
                setAdjustmentType(v);
                // Update existing items to match new type
                const isNegative = v !== 'gain';
                setItems(items.map(i => ({
                  ...i,
                  adjustmentQty: isNegative ? -Math.abs(i.adjustmentQty) : Math.abs(i.adjustmentQty)
                })));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {adjustmentTypes.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} - {t.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason *</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a detailed reason for this adjustment..."
              rows={2}
            />
          </div>

          {/* Add Items */}
          <div className="space-y-2">
            <Label>Add Products</Label>
            <div className="flex gap-2">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {mockProducts.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.sku}) - Current: {p.currentStock}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddItem} disabled={!selectedProduct || !adjustmentType}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-center">Current Stock</TableHead>
                    <TableHead className="text-center">Adjustment</TableHead>
                    <TableHead className="text-center">New Stock</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell className="text-center">{item.currentStock}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className={item.adjustmentQty >= 0 ? 'text-[hsl(var(--success))]' : 'text-destructive'}>
                            {item.adjustmentQty >= 0 ? '+' : ''}
                          </span>
                          <Input
                            type="number"
                            min={1}
                            value={Math.abs(item.adjustmentQty)}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            className="w-20 text-center"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {item.currentStock + item.adjustmentQty}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary */}
          {items.length > 0 && (
            <div className="flex justify-end gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Total Items:</span>
                <span className="ml-2 font-medium">{totalItems}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Net Change:</span>
                <span className={`ml-2 font-medium ${totalChange >= 0 ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}>
                  {totalChange >= 0 ? '+' : ''}{totalChange}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit for Approval</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
