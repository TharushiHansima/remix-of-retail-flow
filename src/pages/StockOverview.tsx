import { useState } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

// Mock data - Comprehensive stock levels
const mockStockData = [
  { id: '1', sku: 'IPH-15-PRO', name: 'iPhone 15 Pro', category: 'Smartphones', brand: 'Apple', quantity: 45, minStock: 10, maxStock: 100, reserved: 5, costPrice: 999, sellingPrice: 1199 },
  { id: '2', sku: 'SAM-S24-ULT', name: 'Samsung S24 Ultra', category: 'Smartphones', brand: 'Samsung', quantity: 32, minStock: 15, maxStock: 80, reserved: 3, costPrice: 899, sellingPrice: 1099 },
  { id: '3', sku: 'XIА-14-PRO', name: 'Xiaomi 14 Pro', category: 'Smartphones', brand: 'Xiaomi', quantity: 8, minStock: 20, maxStock: 60, reserved: 0, costPrice: 599, sellingPrice: 749 },
  { id: '4', sku: 'USB-C-CHG', name: 'USB-C Fast Charger', category: 'Chargers', brand: 'Generic', quantity: 150, minStock: 50, maxStock: 300, reserved: 10, costPrice: 15, sellingPrice: 29 },
  { id: '5', sku: 'CASE-IPH-15', name: 'iPhone 15 Case', category: 'Cases & Covers', brand: 'Apple', quantity: 3, minStock: 25, maxStock: 100, reserved: 0, costPrice: 25, sellingPrice: 49 },
  { id: '6', sku: 'MAC-AIR-M3', name: 'MacBook Air M3', category: 'Laptops', brand: 'Apple', quantity: 12, minStock: 5, maxStock: 30, reserved: 2, costPrice: 1099, sellingPrice: 1299 },
  { id: '7', sku: 'IPAD-PRO-12', name: 'iPad Pro 12.9"', category: 'Tablets', brand: 'Apple', quantity: 18, minStock: 8, maxStock: 40, reserved: 1, costPrice: 999, sellingPrice: 1199 },
  { id: '8', sku: 'PIX-8-PRO', name: 'Google Pixel 8 Pro', category: 'Smartphones', brand: 'Google', quantity: 0, minStock: 10, maxStock: 50, reserved: 0, costPrice: 799, sellingPrice: 999 },
  { id: '9', sku: 'APP-WATCH-S9', name: 'Apple Watch Series 9', category: 'Wearables', brand: 'Apple', quantity: 28, minStock: 10, maxStock: 50, reserved: 4, costPrice: 349, sellingPrice: 449 },
  { id: '10', sku: 'SAM-BUDS-PRO', name: 'Samsung Galaxy Buds Pro', category: 'Audio', brand: 'Samsung', quantity: 65, minStock: 20, maxStock: 100, reserved: 8, costPrice: 149, sellingPrice: 229 },
  { id: '11', sku: 'AIRPODS-MAX', name: 'AirPods Max', category: 'Audio', brand: 'Apple', quantity: 5, minStock: 8, maxStock: 25, reserved: 1, costPrice: 449, sellingPrice: 549 },
  { id: '12', sku: 'SCREEN-PROT', name: 'Tempered Glass Screen Protector', category: 'Accessories', brand: 'Generic', quantity: 200, minStock: 50, maxStock: 500, reserved: 0, costPrice: 3, sellingPrice: 15 },
  { id: '13', sku: 'HDMI-CBL-2M', name: 'HDMI Cable 2M', category: 'Cables', brand: 'Generic', quantity: 85, minStock: 30, maxStock: 200, reserved: 5, costPrice: 8, sellingPrice: 19 },
  { id: '14', sku: 'DELL-XPS-15', name: 'Dell XPS 15', category: 'Laptops', brand: 'Dell', quantity: 6, minStock: 5, maxStock: 20, reserved: 0, costPrice: 1299, sellingPrice: 1599 },
  { id: '15', sku: 'LENOVO-T14', name: 'Lenovo ThinkPad T14', category: 'Laptops', brand: 'Lenovo', quantity: 9, minStock: 5, maxStock: 25, reserved: 2, costPrice: 999, sellingPrice: 1199 },
  { id: '16', sku: 'HP-SPECTRE', name: 'HP Spectre x360', category: 'Laptops', brand: 'HP', quantity: 4, minStock: 5, maxStock: 20, reserved: 0, costPrice: 1149, sellingPrice: 1399 },
  { id: '17', sku: 'WIRELESS-MSE', name: 'Logitech MX Master 3', category: 'Accessories', brand: 'Logitech', quantity: 42, minStock: 15, maxStock: 80, reserved: 3, costPrice: 79, sellingPrice: 99 },
  { id: '18', sku: 'MECH-KEYBD', name: 'Keychron K2 Mechanical Keyboard', category: 'Accessories', brand: 'Keychron', quantity: 22, minStock: 10, maxStock: 50, reserved: 0, costPrice: 69, sellingPrice: 89 },
  { id: '19', sku: 'USB-HUB-7P', name: 'USB Hub 7-Port', category: 'Accessories', brand: 'Anker', quantity: 55, minStock: 20, maxStock: 100, reserved: 5, costPrice: 29, sellingPrice: 49 },
  { id: '20', sku: 'POWER-BANK', name: 'Power Bank 20000mAh', category: 'Chargers', brand: 'Anker', quantity: 38, minStock: 15, maxStock: 80, reserved: 2, costPrice: 35, sellingPrice: 59 },
  { id: '21', sku: 'CAR-CHARGER', name: 'Car Charger Dual USB', category: 'Chargers', brand: 'Generic', quantity: 120, minStock: 40, maxStock: 250, reserved: 0, costPrice: 8, sellingPrice: 19 },
  { id: '22', sku: 'WEBCAM-1080', name: 'Logitech C920 Webcam', category: 'Accessories', brand: 'Logitech', quantity: 15, minStock: 10, maxStock: 40, reserved: 1, costPrice: 59, sellingPrice: 79 },
  { id: '23', sku: 'MONITOR-27', name: 'Dell 27" 4K Monitor', category: 'Monitors', brand: 'Dell', quantity: 7, minStock: 5, maxStock: 20, reserved: 0, costPrice: 349, sellingPrice: 449 },
  { id: '24', sku: 'ROUTER-WIFI6', name: 'TP-Link WiFi 6 Router', category: 'Networking', brand: 'TP-Link', quantity: 18, minStock: 8, maxStock: 40, reserved: 2, costPrice: 89, sellingPrice: 129 },
  { id: '25', sku: 'SSD-1TB', name: 'Samsung 970 EVO SSD 1TB', category: 'Storage', brand: 'Samsung', quantity: 25, minStock: 10, maxStock: 60, reserved: 3, costPrice: 99, sellingPrice: 149 },
];

const branches = [
  { id: 'all', name: 'All Branches' },
  { id: 'main', name: 'Main Store' },
  { id: 'downtown', name: 'Downtown Store' },
  { id: 'warehouse', name: 'Warehouse' },
  { id: 'branch2', name: 'Mall Outlet' },
];

export default function StockOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  const getStockStatus = (item: typeof mockStockData[0]) => {
    const available = item.quantity - item.reserved;
    if (available === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (available <= item.minStock) return { label: 'Low Stock', variant: 'secondary' as const };
    if (available >= item.maxStock * 0.9) return { label: 'Overstocked', variant: 'outline' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const getStockLevel = (item: typeof mockStockData[0]) => {
    return Math.min((item.quantity / item.maxStock) * 100, 100);
  };

  const filteredData = mockStockData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const status = getStockStatus(item);
    const matchesStockFilter = stockFilter === 'all' ||
                               (stockFilter === 'low' && status.label === 'Low Stock') ||
                               (stockFilter === 'out' && status.label === 'Out of Stock') ||
                               (stockFilter === 'over' && status.label === 'Overstocked');
    return matchesSearch && matchesCategory && matchesStockFilter;
  });

  const totalItems = mockStockData.length;
  const lowStockItems = mockStockData.filter(i => getStockStatus(i).label === 'Low Stock').length;
  const outOfStockItems = mockStockData.filter(i => getStockStatus(i).label === 'Out of Stock').length;
  const totalValue = mockStockData.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0);

  const categories = [...new Set(mockStockData.map(i => i.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Overview</h1>
          <p className="text-muted-foreground">Monitor stock levels across all products</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalItems}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <TrendingDown className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowStockItems}</p>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{outOfStockItems}</p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Stock Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Stock Levels</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                  <SelectItem value="over">Overstocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => {
                const status = getStockStatus(item);
                const available = item.quantity - item.reserved;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.brand}</TableCell>
                    <TableCell>{available}</TableCell>
                    <TableCell>{item.reserved}</TableCell>
                    <TableCell className="w-32">
                      <div className="space-y-1">
                        <Progress 
                          value={getStockLevel(item)} 
                          className={`h-2 ${status.label === 'Out of Stock' ? '[&>div]:bg-destructive' : status.label === 'Low Stock' ? '[&>div]:bg-yellow-500' : ''}`}
                        />
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} / {item.maxStock}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${(item.quantity * item.costPrice).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
