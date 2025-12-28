import { AlertTriangle, Package, Clock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "low_stock" | "overdue" | "credit" | "approval";
  title: string;
  description: string;
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "low_stock",
    title: "Low Stock Alert",
    description: "Samsung Galaxy S24 - Only 3 units remaining",
  },
  {
    id: "2",
    type: "low_stock",
    title: "Low Stock Alert",
    description: "iPhone 15 Pro Max 256GB - Only 2 units remaining",
  },
  {
    id: "3",
    type: "overdue",
    title: "Overdue Repair",
    description: "Job Card #JC-2024-0089 exceeded SLA by 2 days",
  },
  {
    id: "4",
    type: "credit",
    title: "Overdue Credit",
    description: "Customer ABC Corp has $5,240 overdue by 30 days",
  },
];

const alertIcons = {
  low_stock: Package,
  overdue: Clock,
  credit: CreditCard,
  approval: AlertTriangle,
};

const alertColors = {
  low_stock: "text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10",
  overdue: "text-destructive bg-destructive/10",
  credit: "text-destructive bg-destructive/10",
  approval: "text-[hsl(var(--info))] bg-[hsl(var(--info))]/10",
};

export function AlertWidget() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-card-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
          Active Alerts
        </h3>
      </div>
      <div className="divide-y divide-border">
        {alerts.map((alert) => {
          const Icon = alertIcons[alert.type];
          return (
            <div
              key={alert.id}
              className="p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className={cn("p-2 rounded-lg", alertColors[alert.type])}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm text-card-foreground">{alert.title}</p>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-border">
        <button className="text-sm font-medium text-primary hover:underline">
          View All Alerts
        </button>
      </div>
    </div>
  );
}
