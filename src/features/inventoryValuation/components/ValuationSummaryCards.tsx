import { Package, Boxes, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ValuationSummary } from "../types";

interface ValuationSummaryCardsProps {
  summary: ValuationSummary | null;
  isLoading?: boolean;
}

// LKR currency formatter
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-LK").format(value);

export function ValuationSummaryCards({
  summary,
  isLoading,
}: ValuationSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total SKUs",
      value: formatNumber(summary?.totalSkus || 0),
      icon: Package,
      description: "Unique products",
    },
    {
      title: "On-hand Qty",
      value: formatNumber(summary?.totalOnHandQty || 0),
      icon: Boxes,
      description: "Total units in stock",
    },
    {
      title: "Stock Value",
      value: formatCurrency(summary?.totalStockValue || 0),
      icon: DollarSign,
      description: "Total inventory value",
    },
    {
      title: "Avg Unit Cost",
      value: formatCurrency(summary?.averageUnitCost || 0),
      icon: TrendingUp,
      description: "Average cost per unit",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
