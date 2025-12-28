import {
  DollarSign,
  TrendingUp,
  Clock,
  Wrench,
  ShoppingCart,
  Users,
  Package,
  FileText,
} from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { AlertWidget } from "@/components/dashboard/AlertWidget";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Today's Sales"
          value="$12,426"
          change={8.2}
          changeLabel="vs yesterday"
          icon={DollarSign}
          variant="success"
        />
        <KPICard
          title="Gross Profit"
          value="$2,845"
          change={5.1}
          changeLabel="vs yesterday"
          icon={TrendingUp}
          variant="info"
        />
        <KPICard
          title="Pending Approvals"
          value="7"
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="Open Repairs"
          value="23"
          change={-12}
          changeLabel="vs last week"
          icon={Wrench}
          variant="default"
        />
      </div>

      {/* Charts and Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <AlertWidget />
        </div>
      </div>

      {/* Quick Stats and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-card-foreground">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Invoices Today</span>
                </div>
                <span className="font-semibold text-card-foreground">24</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[hsl(var(--success))]/10">
                    <Users className="h-4 w-4 text-[hsl(var(--success))]" />
                  </div>
                  <span className="text-sm text-muted-foreground">New Customers</span>
                </div>
                <span className="font-semibold text-card-foreground">8</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[hsl(var(--warning))]/10">
                    <Package className="h-4 w-4 text-[hsl(var(--warning))]" />
                  </div>
                  <span className="text-sm text-muted-foreground">Low Stock Items</span>
                </div>
                <span className="font-semibold text-card-foreground">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[hsl(var(--info))]/10">
                    <FileText className="h-4 w-4 text-[hsl(var(--info))]" />
                  </div>
                  <span className="text-sm text-muted-foreground">Pending GRNs</span>
                </div>
                <span className="font-semibold text-card-foreground">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
