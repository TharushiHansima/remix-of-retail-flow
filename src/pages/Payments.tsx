import { useState } from 'react';
import { Search, Filter, Eye, DollarSign, CreditCard, Banknote, Building2, Smartphone } from 'lucide-react';
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

interface Payment {
  id: string;
  paymentNumber: string;
  invoiceNumber: string;
  customer: string;
  date: Date;
  method: 'cash' | 'card' | 'bank_transfer' | 'mobile_money';
  amount: number;
  reference?: string;
  status: 'completed' | 'pending' | 'failed';
}

const mockPayments: Payment[] = [
  { id: '1', paymentNumber: 'PAY-2024-0001', invoiceNumber: 'INV-2024-0100', customer: 'John Doe', date: new Date('2024-01-20'), method: 'card', amount: 1299.00, reference: 'TXN-456789', status: 'completed' },
  { id: '2', paymentNumber: 'PAY-2024-0002', invoiceNumber: 'INV-2024-0101', customer: 'Jane Smith', date: new Date('2024-01-21'), method: 'cash', amount: 450.00, status: 'completed' },
  { id: '3', paymentNumber: 'PAY-2024-0003', invoiceNumber: 'INV-2024-0102', customer: 'Bob Wilson', date: new Date('2024-01-22'), method: 'bank_transfer', amount: 2500.00, reference: 'BNK-123456', status: 'pending' },
  { id: '4', paymentNumber: 'PAY-2024-0004', invoiceNumber: 'INV-2024-0103', customer: 'Alice Brown', date: new Date('2024-01-23'), method: 'mobile_money', amount: 199.00, reference: 'MM-789012', status: 'completed' },
  { id: '5', paymentNumber: 'PAY-2024-0005', invoiceNumber: 'INV-2024-0104', customer: 'Charlie Davis', date: new Date('2024-01-24'), method: 'card', amount: 899.00, reference: 'TXN-345678', status: 'failed' },
  { id: '6', paymentNumber: 'PAY-2024-0006', invoiceNumber: 'INV-2024-0105', customer: 'Diana Evans', date: new Date('2024-01-25'), method: 'cash', amount: 350.00, status: 'completed' },
  { id: '7', paymentNumber: 'PAY-2024-0007', invoiceNumber: 'INV-2024-0106', customer: 'Frank Green', date: new Date('2024-01-25'), method: 'bank_transfer', amount: 5000.00, reference: 'BNK-654321', status: 'completed' },
];

const methodIcons: Record<string, typeof CreditCard> = {
  cash: Banknote,
  card: CreditCard,
  bank_transfer: Building2,
  mobile_money: Smartphone,
};

const methodLabels: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
};

const statusColors: Record<string, string> = {
  completed: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]',
  pending: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
  failed: 'bg-destructive/10 text-destructive',
};

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const filteredPayments = mockPayments.filter((p) => {
    const matchesSearch = p.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesMethod && matchesStatus;
  });

  const stats = {
    total: mockPayments.length,
    totalAmount: mockPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pending: mockPayments.filter(p => p.status === 'pending').length,
    todayAmount: mockPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
  };

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground">View and manage all payment transactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[hsl(var(--success))]">${stats.totalAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[hsl(var(--warning))]">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${stats.todayAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="mobile_money">Mobile Money</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
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
              <TableHead>Payment #</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => {
              const MethodIcon = methodIcons[payment.method];
              return (
                <TableRow key={payment.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-medium">{payment.paymentNumber}</TableCell>
                  <TableCell className="font-mono text-sm">{payment.invoiceNumber}</TableCell>
                  <TableCell>{payment.customer}</TableCell>
                  <TableCell>{format(payment.date, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MethodIcon className="h-4 w-4 text-muted-foreground" />
                      {methodLabels[payment.method]}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{payment.reference || '-'}</TableCell>
                  <TableCell className="text-right font-medium">${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[payment.status]}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(payment)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-lg font-bold">{selectedPayment.paymentNumber}</p>
                  <p className="text-sm text-muted-foreground">{format(selectedPayment.date, 'MMMM d, yyyy h:mm a')}</p>
                </div>
                <Badge className={statusColors[selectedPayment.status]}>
                  {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                </Badge>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedPayment.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invoice</p>
                  <p className="font-medium font-mono">{selectedPayment.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const MethodIcon = methodIcons[selectedPayment.method];
                      return <MethodIcon className="h-4 w-4" />;
                    })()}
                    <span className="font-medium">{methodLabels[selectedPayment.method]}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reference</p>
                  <p className="font-medium font-mono">{selectedPayment.reference || 'N/A'}</p>
                </div>
              </div>
              <Separator />
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-3xl font-bold text-[hsl(var(--success))]">${selectedPayment.amount.toFixed(2)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
