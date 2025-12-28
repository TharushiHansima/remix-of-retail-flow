import { ShoppingCart, Wrench, Package, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "sale" | "repair" | "stock" | "invoice";
  title: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "sale",
    title: "New Sale",
    description: "Invoice #INV-2024-0156 - $1,245.00",
    time: "5 min ago",
  },
  {
    id: "2",
    type: "repair",
    title: "Job Card Created",
    description: "JC-2024-0092 - MacBook Pro Screen Repair",
    time: "15 min ago",
  },
  {
    id: "3",
    type: "stock",
    title: "Stock Received",
    description: "GRN-2024-0045 - 50 units received",
    time: "1 hour ago",
  },
  {
    id: "4",
    type: "invoice",
    title: "Quotation Approved",
    description: "QT-2024-0078 converted to invoice",
    time: "2 hours ago",
  },
  {
    id: "5",
    type: "repair",
    title: "Repair Completed",
    description: "JC-2024-0088 - iPhone Battery Replacement",
    time: "3 hours ago",
  },
];

const activityIcons = {
  sale: ShoppingCart,
  repair: Wrench,
  stock: Package,
  invoice: FileText,
};

const activityColors = {
  sale: "text-[hsl(var(--success))] bg-[hsl(var(--success))]/10",
  repair: "text-[hsl(var(--info))] bg-[hsl(var(--info))]/10",
  stock: "text-[hsl(var(--chart-3))] bg-[hsl(var(--chart-3))]/10",
  invoice: "text-primary bg-primary/10",
};

export function RecentActivity() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-card-foreground">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          return (
            <div
              key={activity.id}
              className="p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className={cn("p-2 rounded-lg", activityColors[activity.type])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-card-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
