import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Eye, CheckCircle, XCircle, RotateCcw, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Return {
  id: string;
  returnNumber: string;
  invoiceNumber: string;
  customer: string;
  date: Date;
  type: 'return' | 'refund' | 'exchange';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason: string;
  itemCount: number;
  amount: number;
}

const mockReturns: Return[] = [
  { id: '1', returnNumber: 'RET-2024-0001', invoiceNumber: 'INV-2024-0100', customer: 'John Doe', date: new Date('2024-01-20'), type: 'return', status: 'completed', reason: 'Defective product', itemCount: 1, amount: 899.00 },
  { id: '2', returnNumber: 'RET-2024-0002', invoiceNumber: 'INV-2024-0095', customer: 'Jane Smith', date: new Date('2024-01-22'), type: 'refund', status: 'approved', reason: 'Wrong item received', itemCount: 2, amount: 450.00 },
  { id: '3', returnNumber: 'RET-2024-0003', invoiceNumber: 'INV-2024-0110', customer: 'Bob Wilson', date: new Date('2024-01-23'), type: 'exchange', status: 'pending', reason: 'Size exchange', itemCount: 1, amount: 0 },
  { id: '4', returnNumber: 'RET-2024-0004', invoiceNumber: 'INV-2024-0088', customer: 'Alice Brown', date: new Date('2024-01-24'), type: 'return', status: 'rejected', reason: 'Outside return window', itemCount: 1, amount: 299.00 },
  { id: '5', returnNumber: 'RET-2024-0005', invoiceNumber: 'INV-2024-0115', customer: 'Charlie Davis', date: new Date('2024-01-25'), type: 'refund', status: 'pending', reason: 'Customer dissatisfied', itemCount: 3, amount: 1200.00 },
];

const statusColors: Record<string, string> = {
  pending: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
  approved: 'bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]',
  rejected: 'bg-destructive/10 text-destructive',
  completed: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]',
};

const typeColors: Record<string, string> = {
  return: 'bg-muted text-muted-foreground',
  refund: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
  exchange: 'bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]',
};

export default function ReturnsRefunds() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredReturns = mockReturns.filter((r) => {
    const matchesSearch = r.returnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: mockReturns.length,
    pending: mockReturns.filter(r => r.status === 'pending').length,
    totalRefundAmount: mockReturns.filter(r => r.status === 'completed' || r.status === 'approved').reduce((sum, r) => sum + r.amount, 0),
  };

  const handleView = (ret: Return) => {
    setSelectedReturn(ret);
    setViewDialogOpen(true);
  };

  const handleApprove = (ret: Return) => {
    toast.success(`Return ${ret.returnNumber} approved`);
  };

  const handleReject = (ret: Return) => {
    toast.success(`Return ${ret.returnNumber} rejected`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Returns & Refunds</h1>
          <p className="text-muted-foreground">Process returns, refunds and exchanges</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Return
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[hsl(var(--warning))]">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Refund Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${stats.totalRefundAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockReturns.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search returns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="return">Return</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
            <SelectItem value="exchange">Exchange</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Return #</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReturns.map((ret) => (
              <TableRow key={ret.id} className="hover:bg-muted/30">
                <TableCell className="font-mono font-medium">{ret.returnNumber}</TableCell>
                <TableCell className="font-mono text-sm">{ret.invoiceNumber}</TableCell>
                <TableCell>{ret.customer}</TableCell>
                <TableCell>{format(ret.date, 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <Badge className={typeColors[ret.type]}>
                    {ret.type.charAt(0).toUpperCase() + ret.type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{ret.reason}</TableCell>
                <TableCell className="text-right font-medium">
                  {ret.amount > 0 ? `$${ret.amount.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[ret.status]}>
                    {ret.status.charAt(0).toUpperCase() + ret.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(ret)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {ret.status === 'pending' && (
                        <>
                          <DropdownMenuItem onClick={() => handleApprove(ret)} className="text-[hsl(var(--success))]">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReject(ret)} className="text-destructive">
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      {ret.status === 'approved' && ret.type === 'refund' && (
                        <DropdownMenuItem>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Process Refund
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Return Details</DialogTitle>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-lg font-bold">{selectedReturn.returnNumber}</p>
                  <p className="text-sm text-muted-foreground">{format(selectedReturn.date, 'MMMM d, yyyy')}</p>
                </div>
                <Badge className={statusColors[selectedReturn.status]}>
                  {selectedReturn.status.charAt(0).toUpperCase() + selectedReturn.status.slice(1)}
                </Badge>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedReturn.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Original Invoice</p>
                  <p className="font-medium font-mono">{selectedReturn.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge className={typeColors[selectedReturn.type]}>
                    {selectedReturn.type.charAt(0).toUpperCase() + selectedReturn.type.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Refund Amount</p>
                  <p className="font-medium text-lg">
                    {selectedReturn.amount > 0 ? `$${selectedReturn.amount.toFixed(2)}` : 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reason</p>
                <p className="p-3 bg-muted/50 rounded-lg mt-1">{selectedReturn.reason}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Return</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Original Invoice</Label>
                <Input placeholder="Enter invoice number" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="return">Return</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="exchange">Exchange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea placeholder="Describe the reason for return..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { setCreateDialogOpen(false); toast.success('Return created'); }}>
              Create Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
