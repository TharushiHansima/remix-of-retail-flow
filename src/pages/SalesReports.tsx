import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Download, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const salesData = [
  { month: "Jan", sales: 45200, profit: 12400 },
  { month: "Feb", sales: 52100, profit: 14800 },
  { month: "Mar", sales: 48700, profit: 13200 },
  { month: "Apr", sales: 61400, profit: 17600 },
  { month: "May", sales: 55800, profit: 15400 },
  { month: "Jun", sales: 67200, profit: 19800 },
];

const categoryData = [
  { name: "Smartphones", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Laptops", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Accessories", value: 18, color: "hsl(var(--chart-3))" },
  { name: "Tablets", value: 12, color: "hsl(var(--chart-4))" },
];

const topProducts = [
  { name: "iPhone 15 Pro Max 256GB", units: 124, revenue: 148676 },
  { name: "Samsung Galaxy S24 Ultra", units: 98, revenue: 107702 },
  { name: "MacBook Pro 14\" M3", units: 42, revenue: 83958 },
  { name: "AirPods Pro 2nd Gen", units: 186, revenue: 46314 },
  { name: "iPad Pro 12.9\" M2", units: 35, revenue: 38465 },
];

export default function SalesReports() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Reports</h1>
          <p className="text-muted-foreground">Analyze your sales performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 6 Months
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Branches</SelectItem>
            <SelectItem value="main">Main Branch</SelectItem>
            <SelectItem value="downtown">Downtown</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="smartphones">Smartphones</SelectItem>
            <SelectItem value="laptops">Laptops</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales & Profit Chart */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-card-foreground mb-4">Sales & Profit Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                />
                <Bar dataKey="sales" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-card-foreground mb-4">Sales by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Top Selling Products</h3>
        </div>
        <div className="divide-y divide-border">
          {topProducts.map((product, index) => (
            <div key={index} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <span className="font-medium text-card-foreground">{product.name}</span>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Units Sold</p>
                  <p className="font-semibold">{product.units}</p>
                </div>
                <div className="text-right min-w-24">
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="font-semibold text-[hsl(var(--success))]">
                    ${product.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
