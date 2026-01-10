import { X, Package, Calendar, Layers, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import type { ProductValuationDetails, MovementType } from "../types";
import { format } from "date-fns";

interface ProductValuationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productDetails: ProductValuationDetails | null;
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

const formatDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), "dd MMM yyyy");
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateStr: string) => {
  try {
    return format(new Date(dateStr), "dd MMM yyyy HH:mm");
  } catch {
    return dateStr;
  }
};

const getMovementBadgeVariant = (type: MovementType): "default" | "destructive" => {
  return type === "IN" ? "default" : "destructive";
};

export function ProductValuationDrawer({
  open,
  onOpenChange,
  productDetails,
  isLoading,
}: ProductValuationDrawerProps) {
  const isFifo = productDetails?.costingMethod === "FIFO";
  const totalFifoValue = productDetails?.fifoLayers.reduce(
    (sum, layer) => sum + layer.layerValue,
    0
  ) || 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <DrawerTitle>
                {isLoading ? (
                  <Skeleton className="h-6 w-64" />
                ) : (
                  <>{productDetails?.productName} — Valuation</>
                )}
              </DrawerTitle>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="p-6 overflow-y-auto">
          {/* Summary Strip */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 rounded-lg border bg-muted/30">
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">On-hand Qty</div>
                <div className="text-lg font-bold">
                  {formatNumber(productDetails?.onHandQty || 0)}
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">
                  Unit Cost ({productDetails?.costingMethod})
                </div>
                <div className="text-lg font-bold">
                  {formatCurrency(productDetails?.unitCost || 0)}
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">Total Value</div>
                <div className="text-lg font-bold text-primary">
                  {formatCurrency(productDetails?.totalValue || 0)}
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">Last Receipt</div>
                <div className="text-lg font-bold">
                  {productDetails?.lastReceiptDate
                    ? formatDate(productDetails.lastReceiptDate)
                    : "—"}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="summary">
            <TabsList className="mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="fifo" disabled={!isFifo}>
                FIFO Layers
              </TabsTrigger>
              <TabsTrigger value="movements">Movements</TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between py-2 border-b">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">SKU</span>
                    <span className="font-medium">{productDetails?.sku}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Brand</span>
                    <span className="font-medium">{productDetails?.brandName || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{productDetails?.categoryName || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Supplier</span>
                    <span className="font-medium">{productDetails?.supplierName || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Costing Method</span>
                    <Badge variant={isFifo ? "default" : "secondary"}>
                      {productDetails?.costingMethod === "MOVING_AVG"
                        ? "Moving Average"
                        : productDetails?.costingMethod}
                    </Badge>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* FIFO Layers Tab */}
            <TabsContent value="fifo">
              {isLoading ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>GRN Date</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Received Qty</TableHead>
                        <TableHead className="text-right">Remaining Qty</TableHead>
                        <TableHead className="text-right">Unit Cost</TableHead>
                        <TableHead className="text-right">Layer Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[1, 2, 3].map((i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : productDetails?.fifoLayers && productDetails.fifoLayers.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            GRN Date
                          </div>
                        </TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Received Qty</TableHead>
                        <TableHead className="text-right">Remaining Qty</TableHead>
                        <TableHead className="text-right">Unit Cost</TableHead>
                        <TableHead className="text-right">Layer Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productDetails.fifoLayers.map((layer) => (
                        <TableRow key={layer.id}>
                          <TableCell>{formatDate(layer.grnDate)}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {layer.grnNumber || "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(layer.receivedQty)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatNumber(layer.remainingQty)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(layer.unitCost)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(layer.layerValue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={5} className="text-right font-medium">
                          Total FIFO Value
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {formatCurrency(totalFifoValue)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No FIFO layers available for this product.</p>
                </div>
              )}
            </TabsContent>

            {/* Movements Tab */}
            <TabsContent value="movements">
              {isLoading ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date/Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Cost</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[1, 2, 3, 4].map((i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : productDetails?.movements && productDetails.movements.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Date/Time
                          </div>
                        </TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Cost</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productDetails.movements.map((mov) => (
                        <TableRow key={mov.id}>
                          <TableCell className="text-sm">
                            {formatDateTime(mov.dateTime)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getMovementBadgeVariant(mov.type)}>
                              {mov.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {mov.documentType}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {mov.referenceNo}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {mov.type === "OUT" ? "-" : "+"}
                            {formatNumber(mov.qty)}
                          </TableCell>
                          <TableCell className="text-right">
                            {mov.unitCost ? formatCurrency(mov.unitCost) : "—"}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatNumber(mov.runningBalance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <ArrowRightLeft className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No movements recorded for this product.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
