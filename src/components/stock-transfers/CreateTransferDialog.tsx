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

interface TransferItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  availableStock: number;
}

interface CreateTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockProducts = [
  { id: '1', name: 'iPhone 15 Pro', sku: 'IPH-15-PRO', availableStock: 45 },
  { id: '2', name: 'Samsung S24 Ultra', sku: 'SAM-S24-ULT', availableStock: 32 },
  { id: '3', name: 'MacBook Air M3', sku: 'MAC-AIR-M3', availableStock: 12 },
  { id: '4', name: 'iPad Pro 12.9"', sku: 'IPAD-PRO-12', availableStock: 18 },
];

const mockBranches = [
  { id: '1', name: 'Main Branch' },
  { id: '2', name: 'Warehouse' },
  { id: '3', name: 'Downtown Store' },
];

export function CreateTransferDialog({ open, onOpenChange }: CreateTransferDialogProps) {
  const [fromBranch, setFromBranch] = useState('');
  const [toBranch, setToBranch] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<TransferItem[]>([]);
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
      quantity: 1,
      availableStock: product.availableStock,
    }]);
    setSelectedProduct('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setItems(items.map(i => i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i));
  };

  const handleSubmit = () => {
    if (!fromBranch || !toBranch) {
      toast.error('Please select source and destination branches');
      return;
    }
    if (fromBranch === toBranch) {
      toast.error('Source and destination branches must be different');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    toast.success('Transfer created successfully');
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFromBranch('');
    setToBranch('');
    setNotes('');
    setItems([]);
    setSelectedProduct('');
  };

  const totalItems = items.length;
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Stock Transfer</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Branch Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Branch *</Label>
              <Select value={fromBranch} onValueChange={setFromBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source branch" />
                </SelectTrigger>
                <SelectContent>
                  {mockBranches.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To Branch *</Label>
              <Select value={toBranch} onValueChange={setToBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination branch" />
                </SelectTrigger>
                <SelectContent>
                  {mockBranches.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                      {p.name} ({p.sku}) - {p.availableStock} available
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddItem} disabled={!selectedProduct}>
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
                    <TableHead className="text-center">Available</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell className="text-center">{item.availableStock}</TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min={1}
                          max={item.availableStock}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-20 mx-auto text-center"
                        />
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
                <span className="text-muted-foreground">Total Quantity:</span>
                <span className="ml-2 font-medium">{totalQty}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this transfer..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
