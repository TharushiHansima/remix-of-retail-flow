import { useState } from "react";
import { format } from "date-fns";
import { Layers, Package, TrendingDown, Calendar, DollarSign, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useCostLayers } from "@/features/inventory/valuation/useValuation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CostLayersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  branchId?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

export function CostLayersDialog({
  open,
  onOpenChange,
  productId,
  productName,
  branchId,
}: CostLayersDialogProps) {
  const { data: costLayers = [], isLoading: layersLoading, refetch } = useCostLayers(productId, branchId);

  // Fetch consumption history
  const { data: consumptions = [], isLoading: consumptionsLoading } = useQuery({
    queryKey: ["costLayerConsumptions", productId],
    queryFn: async () => {
      const layerIds = costLayers.map((l) => l.id);
      if (layerIds.length === 0) return [];

      const { data, error } = await supabase
        .from("cost_layer_consumptions")
        .select("*")
        .in("cost_layer_id", layerIds)
        .order("consumed_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: open && costLayers.length > 0,
  });

  // Calculate summary stats
  const activeLayers = costLayers.filter((l) => !l.isExhausted && l.remainingQty > 0);
  const totalRemainingQty = activeLayers.reduce((sum, l) => sum + l.remainingQty, 0);
  const totalRemainingValue = activeLayers.reduce((sum, l) => sum + l.remainingQty * l.unitCost, 0);
  const avgCost = totalRemainingQty > 0 ? totalRemainingValue / totalRemainingQty : 0;

  // Oldest layer for FIFO
  const oldestLayer = activeLayers.length > 0 ? activeLayers[0] : null;
  const oldestDays = oldestLayer
    ? Math.floor((Date.now() - new Date(oldestLayer.receivedDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            FIFO Cost Layers
          </DialogTitle>
          <DialogDescription>
            Cost layer history and consumption for "{productName}"
          </DialogDescription>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Active Layers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLayers.length}</div>
              <p className="text-xs text-muted-foreground">
                of {costLayers.length} total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Remaining Qty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRemainingQty.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">units in stock</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRemainingValue)}</div>
              <p className="text-xs text-muted-foreground">
                avg {formatCurrency(avgCost)}/unit
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Oldest Layer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{oldestDays}</div>
              <p className="text-xs text-muted-foreground">days old</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="layers" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="layers">Cost Layers</TabsTrigger>
              <TabsTrigger value="consumptions">Consumption History</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <TabsContent value="layers">
            <ScrollArea className="h-[350px]">
              {layersLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : costLayers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-1">No Cost Layers</h3>
                  <p className="text-sm text-muted-foreground">
                    This product uses weighted average costing or has no receipts yet.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Received Date</TableHead>
                      <TableHead className="text-right">Received</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costLayers.map((layer) => {
                      const isActive = !layer.isExhausted && layer.remainingQty > 0;
                      const value = layer.remainingQty * layer.unitCost;

                      return (
                        <TableRow
                          key={layer.id}
                          className={!isActive ? "opacity-50" : ""}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {layer.sourceType === "grn" ? (
                                <Package className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                              )}
                              <div>
                                <p className="font-medium capitalize">{layer.sourceType}</p>
                                {layer.sourceNumber && (
                                  <p className="text-xs text-muted-foreground">
                                    {layer.sourceNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {format(new Date(layer.receivedDate), "MMM dd, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{layer.receivedQty}</TableCell>
                          <TableCell className="text-right font-medium">
                            {layer.remainingQty}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(layer.unitCost)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(value)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={isActive ? "default" : "secondary"}>
                              {isActive ? "Active" : "Exhausted"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="consumptions">
            <ScrollArea className="h-[350px]">
              {consumptionsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : consumptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingDown className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-1">No Consumption History</h3>
                  <p className="text-sm text-muted-foreground">
                    No FIFO layer consumptions recorded yet.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">COGS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consumptions.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {c.consumption_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {c.consumption_number || "-"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(c.consumed_at), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">{c.quantity_consumed}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(c.unit_cost_at_consumption)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(c.total_cost)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
