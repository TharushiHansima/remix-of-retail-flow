import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Search, Download, Filter, User, Clock, Activity } from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
}

const mockAuditLogs: AuditLog[] = [
  { id: '1', timestamp: '2026-01-05 14:32:15', user: 'Admin User', userRole: 'admin', action: 'CREATE', module: 'Inventory', entityType: 'Product', entityId: 'PRD-001', details: 'Created new product: Samsung Galaxy S24', ipAddress: '192.168.1.100' },
  { id: '2', timestamp: '2026-01-05 14:28:10', user: 'John Cashier', userRole: 'cashier', action: 'CREATE', module: 'Sales', entityType: 'Invoice', entityId: 'INV-000125', details: 'Created invoice for Walk-in Customer', ipAddress: '192.168.1.101' },
  { id: '3', timestamp: '2026-01-05 14:15:00', user: 'Admin User', userRole: 'admin', action: 'UPDATE', module: 'Users', entityType: 'User', entityId: 'USR-003', details: 'Approved user account: jane@example.com', ipAddress: '192.168.1.100' },
  { id: '4', timestamp: '2026-01-05 13:45:22', user: 'Store Manager', userRole: 'manager', action: 'APPROVE', module: 'Inventory', entityType: 'Stock Adjustment', entityId: 'ADJ-000015', details: 'Approved stock adjustment: +50 units', ipAddress: '192.168.1.102' },
  { id: '5', timestamp: '2026-01-05 13:30:00', user: 'Tech Mike', userRole: 'technician', action: 'UPDATE', module: 'Repairs', entityType: 'Job Card', entityId: 'JOB-000089', details: 'Status changed: Diagnosing → Repairing', ipAddress: '192.168.1.103' },
  { id: '6', timestamp: '2026-01-05 12:15:33', user: 'Admin User', userRole: 'admin', action: 'DELETE', module: 'Inventory', entityType: 'Product', entityId: 'PRD-099', details: 'Deleted inactive product: Old Model XYZ', ipAddress: '192.168.1.100' },
  { id: '7', timestamp: '2026-01-05 11:45:00', user: 'John Cashier', userRole: 'cashier', action: 'CREATE', module: 'Sales', entityType: 'Payment', entityId: 'PAY-000256', details: 'Recorded payment: $450.00 via Card', ipAddress: '192.168.1.101' },
  { id: '8', timestamp: '2026-01-05 11:20:15', user: 'Store Manager', userRole: 'manager', action: 'CREATE', module: 'Suppliers', entityType: 'Purchase Order', entityId: 'PO-000045', details: 'Created PO for TechSupply Inc: $12,500', ipAddress: '192.168.1.102' },
  { id: '9', timestamp: '2026-01-05 10:55:00', user: 'Admin User', userRole: 'admin', action: 'UPDATE', module: 'Config', entityType: 'Settings', entityId: 'SYS-001', details: 'Updated system settings: Currency changed to LKR', ipAddress: '192.168.1.100' },
  { id: '10', timestamp: '2026-01-05 10:30:22', user: 'Warehouse Staff', userRole: 'storekeeper', action: 'CREATE', module: 'Inventory', entityType: 'GRN', entityId: 'GRN-000078', details: 'Received goods: 25 items from PO-000044', ipAddress: '192.168.1.104' },
  { id: '11', timestamp: '2026-01-05 09:45:00', user: 'Admin User', userRole: 'admin', action: 'LOGIN', module: 'Auth', entityType: 'Session', entityId: 'SES-12345', details: 'User logged in successfully', ipAddress: '192.168.1.100' },
  { id: '12', timestamp: '2026-01-05 09:00:00', user: 'System', userRole: 'system', action: 'BACKUP', module: 'System', entityType: 'Database', entityId: 'BKP-001', details: 'Automatic daily backup completed', ipAddress: '127.0.0.1' },
];

const getActionBadgeVariant = (action: string) => {
  switch (action) {
    case 'CREATE': return 'default';
    case 'UPDATE': return 'secondary';
    case 'DELETE': return 'destructive';
    case 'APPROVE': return 'default';
    case 'LOGIN': return 'outline';
    case 'LOGOUT': return 'outline';
    case 'BACKUP': return 'secondary';
    default: return 'secondary';
  }
};

export default function AuditTrail() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesAction && matchesModule;
  });

  const uniqueModules = [...new Set(mockAuditLogs.map(log => log.module))];
  const uniqueActions = [...new Set(mockAuditLogs.map(log => log.action))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audit Trail</h1>
          <p className="text-muted-foreground">Track all system activities and changes</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockAuditLogs.length}</p>
                <p className="text-sm text-muted-foreground">Total Actions Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <User className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">14:32</p>
                <p className="text-sm text-muted-foreground">Last Activity</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Calendar className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">30</p>
                <p className="text-sm text-muted-foreground">Days Retention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, details, or entity ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {uniqueModules.map(module => (
                  <SelectItem key={module} value={module}>{module}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Detailed record of all system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{log.user}</p>
                      <p className="text-xs text-muted-foreground capitalize">{log.userRole}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.module}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{log.entityType}</p>
                      <p className="text-xs text-muted-foreground font-mono">{log.entityId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">{log.details}</TableCell>
                  <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
