import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  CheckCircle,
  Package,
  Truck,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
// CreateGRNDialog removed - GRN creation should come from PO flow

// ✅ API
import { listGrns, getGrn, setGrnVerification } from "@/features/procurement/grns/grns.api";
import type { GrnApi } from "@/features/procurement/grns/grns.types";

interface GRNItem {
  id: string;
  product: string;
  sku: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: Date;
  variance: number;
}

interface LandedCost {
  id: string;
  type: string;
  description: string;
  amount: number;
}

interface GRN {
  id: string;
  grnNumber: string;
  poNumber: string;
  supplier: string;
  branch: string;
  status: "pending" | "verified" | "completed";
  invoiceNumber: string;
  invoiceDate: Date;
  receivedDate: Date;
  subtotal: number;
  landedCost: number;
  totalAmount: number;
  items: GRNItem[];
  landedCosts: LandedCost[];
}

const statusColors: Record<string, string> = {
  pending: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  verified: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]",
  completed: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
};

// ---- adapter: backend -> UI shape (no UI changes) ----
function toDate(v?: string | null): Date {
  const d = v ? new Date(v) : null;
  return d && !isNaN(d.getTime()) ? d : new Date();
}

function toNumber(v?: number | null): number {
  return typeof v === "number" && isFinite(v) ? v : 0;
}

function mapGrn(apiGrn: GrnApi): GRN {
  const poNumber =
    apiGrn.purchaseOrder?.poNumber ||
    apiGrn.purchaseOrder?.number ||
    "—";

  const supplierName = apiGrn.supplier?.name || "—";
  const branchName = apiGrn.branch?.name || "—";

  const items: GRNItem[] = (apiGrn.items ?? []).map((it) => {
    const ordered =
      toNumber(it.quantityOrdered ?? it.orderedQty ?? it.quantity ?? 0);

    const received =
      toNumber(it.quantityReceived ?? it.receivedQty ?? it.quantity ?? 0);

    const unitCost = toNumber(it.unitCost);

    return {
      id: it.id,
      product: it.product?.name || "—",
      sku: it.product?.sku || it.product?.code || "—",
      orderedQty: ordered,
      receivedQty: received,
      unitCost,
      batchNumber: it.batchNumber ?? undefined,
      expiryDate: it.expiryDate ? new Date(it.expiryDate) : undefined,
      variance: received - ordered,
    };
  });

  const landedCosts: LandedCost[] = (apiGrn.landedCosts ?? []).map((c) => ({
    id: c.id,
    type: c.type,
    description: c.description ?? "",
    amount: toNumber(c.amount),
  }));

  const subtotal =
    apiGrn.subtotal ??
    items.reduce((s, it) => s + it.receivedQty * it.unitCost, 0);

  const landedCost =
    apiGrn.landedCost ??
    landedCosts.reduce((s, c) => s + c.amount, 0);

  const totalAmount = apiGrn.totalAmount ?? subtotal + landedCost;

  return {
    id: apiGrn.id,
    grnNumber: apiGrn.grnNumber || "—",
    poNumber,
    supplier: supplierName,
    branch: branchName,
    status: apiGrn.status,
    invoiceNumber: apiGrn.invoiceNumber || "—",
    invoiceDate: toDate(apiGrn.invoiceDate),
    receivedDate: toDate(apiGrn.receivedDate),
    subtotal: toNumber(subtotal),
    landedCost: toNumber(landedCost),
    totalAmount: toNumber(totalAmount),
    items,
    landedCosts,
  };
}

export default function GRN() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  // GRN creation removed - GRN should be created from PO flow

  // ✅ real data
  const [grns, setGrns] = useState<GRN[]>([]);

  async function loadGrns(q?: { search?: string; status?: string }) {
    const query: any = {};
    if (q?.search?.trim()) query.search = q.search.trim();
    if (q?.status && q.status !== "all") query.status = q.status;

    const res = await listGrns(query);
    const list = Array.isArray(res) ? res : res.data;
    setGrns((list ?? []).map(mapGrn));
  }

  useEffect(() => {
    loadGrns({ search: searchQuery, status: statusFilter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadGrns({ search: searchQuery, status: statusFilter });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const filteredGRNs = useMemo(() => {
    // keep your existing UI-side filter too (no UI change)
    return grns.filter((grn) => {
      const matchesSearch =
        grn.grnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grn.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grn.poNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || grn.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [grns, searchQuery, statusFilter]);

  const pendingCount = grns.filter((g) => g.status === "pending").length;
  const totalLandedCost = grns.reduce((sum, g) => sum + g.landedCost, 0);

  async function openDetails(grnId: string) {
    const full = await getGrn(grnId);
    setSelectedGRN(mapGrn(full));
  }

  async function verifyGrn(grnId: string) {
    // ⚠️ if your backend expects different fields, share UpdateGrnVerificationDto and I’ll match it
    await setGrnVerification(grnId, { status: "verified" });
    await loadGrns({ search: searchQuery, status: statusFilter });

    if (selectedGRN?.id === grnId) {
      const full = await getGrn(grnId);
      setSelectedGRN(mapGrn(full));
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Goods Received Notes</h1>
          <p className="text-muted-foreground">Manage goods receipts and landed costs</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* GRN creation dialog removed - GRNs are created from PO flow */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total GRNs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{grns.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[hsl(var(--warning))]">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Landed Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalLandedCost.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${grns.reduce((s, g) => s + g.totalAmount, 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search GRN, PO, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* GRN Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>GRN #</TableHead>
              <TableHead>PO #</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Received Date</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Landed Cost</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGRNs.map((grn) => {
              const hasVariance = grn.items.some((item) => item.variance !== 0);
              return (
                <TableRow key={grn.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-medium">
                    <div className="flex items-center gap-2">
                      {grn.grnNumber}
                      {hasVariance && (
                        <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{grn.poNumber}</TableCell>
                  <TableCell>{grn.supplier}</TableCell>
                  <TableCell>{grn.branch}</TableCell>
                  <TableCell>{format(grn.receivedDate, "MMM dd, yyyy")}</TableCell>
                  <TableCell className="text-right">${grn.subtotal.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${grn.landedCost.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">${grn.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[grn.status]}>
                      {grn.status.charAt(0).toUpperCase() + grn.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DialogTrigger asChild onClick={() => openDetails(grn.id)}>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DialogTrigger>
                          {grn.status === "pending" && (
                            <DropdownMenuItem onClick={() => verifyGrn(grn.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Verify GRN
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Print GRN
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            GRN {selectedGRN?.grnNumber}
                          </DialogTitle>
                        </DialogHeader>
                        {selectedGRN && (
                          <Tabs defaultValue="items" className="w-full">
                            <TabsList>
                              <TabsTrigger value="items">Items</TabsTrigger>
                              <TabsTrigger value="landed-costs">Landed Costs</TabsTrigger>
                              <TabsTrigger value="summary">Summary</TabsTrigger>
                            </TabsList>

                            <TabsContent value="items" className="space-y-4">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">PO Number</p>
                                  <p className="font-medium">{selectedGRN.poNumber}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Supplier</p>
                                  <p className="font-medium">{selectedGRN.supplier}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Invoice #</p>
                                  <p className="font-medium">{selectedGRN.invoiceNumber}</p>
                                </div>
                              </div>

                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead className="text-center">Ordered</TableHead>
                                    <TableHead className="text-center">Received</TableHead>
                                    <TableHead className="text-center">Variance</TableHead>
                                    <TableHead className="text-right">Unit Cost</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedGRN.items.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell className="font-medium">
                                        <div>
                                          {item.product}
                                          {item.batchNumber && (
                                            <p className="text-xs text-muted-foreground">
                                              Batch: {item.batchNumber}
                                            </p>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                                      <TableCell className="text-center">{item.orderedQty}</TableCell>
                                      <TableCell className="text-center">{item.receivedQty}</TableCell>
                                      <TableCell className="text-center">
                                        {item.variance !== 0 ? (
                                          <Badge
                                            className={
                                              item.variance < 0
                                                ? "bg-destructive/10 text-destructive"
                                                : "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                                            }
                                          >
                                            {item.variance > 0 ? "+" : ""}
                                            {item.variance}
                                          </Badge>
                                        ) : (
                                          <span className="text-muted-foreground">-</span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right">${item.unitCost.toFixed(2)}</TableCell>
                                      <TableCell className="text-right font-medium">
                                        ${(item.receivedQty * item.unitCost).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TabsContent>

                            <TabsContent value="landed-costs" className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium">Landed Cost Components</h3>
                                <Button size="sm" variant="outline">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Cost
                                </Button>
                              </div>

                              {selectedGRN.landedCosts.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Type</TableHead>
                                      <TableHead>Description</TableHead>
                                      <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedGRN.landedCosts.map((cost) => (
                                      <TableRow key={cost.id}>
                                        <TableCell className="capitalize">{cost.type}</TableCell>
                                        <TableCell>{cost.description}</TableCell>
                                        <TableCell className="text-right font-medium">
                                          ${cost.amount.toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/50">
                                      <TableCell colSpan={2} className="font-medium">
                                        Total Landed Cost
                                      </TableCell>
                                      <TableCell className="text-right font-bold">
                                        ${selectedGRN.landedCost.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p>No landed costs added yet</p>
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="summary" className="space-y-4">
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <h3 className="font-medium">Receipt Information</h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Received Date</span>
                                      <span>{format(selectedGRN.receivedDate, "MMM dd, yyyy")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Invoice Date</span>
                                      <span>{format(selectedGRN.invoiceDate, "MMM dd, yyyy")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Branch</span>
                                      <span>{selectedGRN.branch}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <h3 className="font-medium">Cost Summary</h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Subtotal</span>
                                      <span>${selectedGRN.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Landed Cost</span>
                                      <span>${selectedGRN.landedCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-medium pt-2 border-t">
                                      <span>Total Value</span>
                                      <span>${selectedGRN.totalAmount.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
