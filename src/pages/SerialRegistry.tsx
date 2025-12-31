import { useState } from 'react';
import { Search, Filter, Eye, FileText, ShieldCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

// Mock data
const mockSerials = [
  { id: '1', serialNumber: 'SN-IPH15P-001234', product: 'iPhone 15 Pro', sku: 'IPH-15-PRO', status: 'available', branch: 'Main Store', purchaseDate: '2024-01-15', warrantyExpiry: '2025-01-15', supplier: 'Apple Inc.', costPrice: 999 },
  { id: '2', serialNumber: 'SN-IPH15P-001235', product: 'iPhone 15 Pro', sku: 'IPH-15-PRO', status: 'sold', branch: 'Main Store', purchaseDate: '2024-01-15', warrantyExpiry: '2025-01-15', supplier: 'Apple Inc.', costPrice: 999, soldDate: '2024-02-20', customer: 'John Doe' },
  { id: '3', serialNumber: 'SN-SAM24U-005678', product: 'Samsung S24 Ultra', sku: 'SAM-S24-ULT', status: 'available', branch: 'Branch 1', purchaseDate: '2024-02-01', warrantyExpiry: '2026-02-01', supplier: 'Samsung Electronics', costPrice: 899 },
  { id: '4', serialNumber: 'SN-SAM24U-005679', product: 'Samsung S24 Ultra', sku: 'SAM-S24-ULT', status: 'in_repair', branch: 'Main Store', purchaseDate: '2024-02-01', warrantyExpiry: '2026-02-01', supplier: 'Samsung Electronics', costPrice: 899, repairJob: 'JOB-000145' },
  { id: '5', serialNumber: 'SN-MBA-M3-003456', product: 'MacBook Air M3', sku: 'MAC-AIR-M3', status: 'available', branch: 'Main Store', purchaseDate: '2024-03-10', warrantyExpiry: '2025-03-10', supplier: 'Apple Inc.', costPrice: 1099 },
  { id: '6', serialNumber: 'SN-PIX8P-007890', product: 'Google Pixel 8 Pro', sku: 'PIX-8-PRO', status: 'reserved', branch: 'Branch 2', purchaseDate: '2024-01-25', warrantyExpiry: '2025-01-25', supplier: 'Google LLC', costPrice: 799, reservedFor: 'INV-000234' },
  { id: '7', serialNumber: 'SN-IPAD12-002345', product: 'iPad Pro 12.9"', sku: 'IPAD-PRO-12', status: 'warranty_claim', branch: 'Main Store', purchaseDate: '2024-02-15', warrantyExpiry: '2025-02-15', supplier: 'Apple Inc.', costPrice: 999, claimNumber: 'WC-000012' },
  { id: '8', serialNumber: 'SN-XIА14P-004567', product: 'Xiaomi 14 Pro', sku: 'XIA-14-PRO', status: 'sold', branch: 'Branch 1', purchaseDate: '2024-01-20', warrantyExpiry: '2025-01-20', supplier: 'Xiaomi Corp', costPrice: 599, soldDate: '2024-03-01', customer: 'Jane Smith' },
];

const branches = [
  { id: 'all', name: 'All Branches' },
  { id: 'main', name: 'Main Store' },
  { id: 'branch1', name: 'Branch 1' },
  { id: 'branch2', name: 'Branch 2' },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  available: { label: 'Available', variant: 'default' },
  sold: { label: 'Sold', variant: 'secondary' },
  reserved: { label: 'Reserved', variant: 'outline' },
  in_repair: { label: 'In Repair', variant: 'secondary' },
  warranty_claim: { label: 'Warranty Claim', variant: 'destructive' },
};

export default function SerialRegistry() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSerial, setSelectedSerial] = useState<typeof mockSerials[0] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filteredData = mockSerials.filter(item => {
    const matchesSearch = item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'all' || item.branch === branches.find(b => b.id === selectedBranch)?.name;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const totalSerials = mockSerials.length;
  const availableSerials = mockSerials.filter(s => s.status === 'available').length;
  const soldSerials = mockSerials.filter(s => s.status === 'sold').length;
  const warrantyExpiringSoon = mockSerials.filter(s => {
    const expiry = new Date(s.warrantyExpiry);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  const openDetails = (serial: typeof mockSerials[0]) => {
    setSelectedSerial(serial);
    setDetailsOpen(true);
  };

  const isWarrantyExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isWarrantyExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Serial Registry</h1>
          <p className="text-muted-foreground">Track and manage serialized inventory</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSerials}</p>
                <p className="text-sm text-muted-foreground">Total Serials</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableSerials}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{soldSerials}</p>
                <p className="text-sm text-muted-foreground">Sold</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{warrantyExpiringSoon}</p>
                <p className="text-sm text-muted-foreground">Warranty Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Serial Numbers</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search serial, product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Warranty Expiry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((serial) => {
                const status = statusConfig[serial.status];
                return (
                  <TableRow key={serial.id}>
                    <TableCell className="font-mono text-sm">{serial.serialNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{serial.product}</p>
                        <p className="text-sm text-muted-foreground">{serial.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell>{serial.branch}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(serial.purchaseDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {format(new Date(serial.warrantyExpiry), 'MMM d, yyyy')}
                        {isWarrantyExpired(serial.warrantyExpiry) && (
                          <Badge variant="destructive" className="text-xs">Expired</Badge>
                        )}
                        {isWarrantyExpiringSoon(serial.warrantyExpiry) && !isWarrantyExpired(serial.warrantyExpiry) && (
                          <Badge variant="outline" className="text-xs text-yellow-600">Expiring Soon</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openDetails(serial)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Serial Details</DialogTitle>
          </DialogHeader>
          {selectedSerial && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-mono text-lg font-bold">{selectedSerial.serialNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{selectedSerial.product}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-medium">{selectedSerial.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={statusConfig[selectedSerial.status].variant}>
                    {statusConfig[selectedSerial.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Branch</p>
                  <p className="font-medium">{selectedSerial.branch}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{selectedSerial.supplier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cost Price</p>
                  <p className="font-medium">${selectedSerial.costPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Date</p>
                  <p className="font-medium">{format(new Date(selectedSerial.purchaseDate), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Warranty Expiry</p>
                  <p className="font-medium">{format(new Date(selectedSerial.warrantyExpiry), 'MMM d, yyyy')}</p>
                </div>
              </div>

              {selectedSerial.status === 'sold' && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Sold To</p>
                      <p className="font-medium">{selectedSerial.customer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sold Date</p>
                      <p className="font-medium">{format(new Date(selectedSerial.soldDate!), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                </>
              )}

              {selectedSerial.status === 'in_repair' && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Repair Job</p>
                    <p className="font-medium text-primary">{selectedSerial.repairJob}</p>
                  </div>
                </>
              )}

              {selectedSerial.status === 'reserved' && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Reserved For</p>
                    <p className="font-medium text-primary">{selectedSerial.reservedFor}</p>
                  </div>
                </>
              )}

              {selectedSerial.status === 'warranty_claim' && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Claim Number</p>
                    <p className="font-medium text-primary">{selectedSerial.claimNumber}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
