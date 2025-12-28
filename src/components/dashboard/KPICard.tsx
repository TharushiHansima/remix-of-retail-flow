import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "success" | "warning" | "info";
}

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  variant = "default",
}: KPICardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  const iconBgColors = {
    default: "bg-primary/10",
    success: "bg-[hsl(var(--success))]/10",
    warning: "bg-[hsl(var(--warning))]/10",
    info: "bg-[hsl(var(--info))]/10",
  };

  const iconColors = {
    default: "text-primary",
    success: "text-[hsl(var(--success))]",
    warning: "text-[hsl(var(--warning))]",
    info: "text-[hsl(var(--info))]",
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-card-foreground">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive && <TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" />}
              {isNegative && <TrendingDown className="h-4 w-4 text-destructive" />}
              <span
                className={cn(
                  "text-sm font-medium",
                  isPositive && "text-[hsl(var(--success))]",
                  isNegative && "text-destructive"
                )}
              >
                {isPositive && "+"}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-sm text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", iconBgColors[variant])}>
          <Icon className={cn("h-6 w-6", iconColors[variant])} />
        </div>
      </div>
    </div>
  );
}
