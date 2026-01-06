import { useState } from "react";
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
import { CreateGRNDialog } from "@/components/grn/CreateGRNDialog";

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

const grns: GRN[] = [
  {
    id: "1",
    grnNumber: "GRN-2024-0001",
    poNumber: "PO-2024-0012",
    supplier: "Apple Inc.",
    branch: "Main Branch",
    status: "completed",
    invoiceNumber: "APL-INV-45678",
    invoiceDate: new Date("2024-01-15"),
    receivedDate: new Date("2024-01-18"),
    subtotal: 9500,
    landedCost: 450,
    totalAmount: 9950,
    items: [
      { id: "1", product: "iPhone 15 Pro Max 256GB", sku: "APL-IP15PM-256", orderedQty: 10, receivedQty: 10, unitCost: 950, variance: 0 },
    ],
    landedCosts: [
      { id: "1", type: "shipping", description: "Air Freight", amount: 350 },
      { id: "2", type: "handling", description: "Warehouse Handling", amount: 100 },
    ],
  },
  {
    id: "2",
    grnNumber: "GRN-2024-0002",
    poNumber: "PO-2024-0015",
    supplier: "Samsung Electronics",
    branch: "Main Branch",
    status: "verified",
    invoiceNumber: "SAM-INV-12345",
    invoiceDate: new Date("2024-01-20"),
    receivedDate: new Date("2024-01-22"),
    subtotal: 8500,
    landedCost: 380,
    totalAmount: 8880,
    items: [
      { id: "1", product: "Samsung Galaxy S24 Ultra", sku: "SAM-S24U-256", orderedQty: 10, receivedQty: 9, unitCost: 850, variance: -1 },
      { id: "2", product: "Samsung Galaxy Tab S9", sku: "SAM-TAB-S9", orderedQty: 5, receivedQty: 5, unitCost: 650, variance: 0 },
    ],
    landedCosts: [
      { id: "1", type: "shipping", description: "Sea Freight", amount: 280 },
      { id: "2", type: "customs", description: "Import Duty", amount: 100 },
    ],
  },
  {
    id: "3",
    grnNumber: "GRN-2024-0003",
    poNumber: "PO-2024-0018",
    supplier: "Generic Tech Supplies",
    branch: "Warehouse",
    status: "pending",
    invoiceNumber: "GTS-2024-789",
    invoiceDate: new Date("2024-01-25"),
    receivedDate: new Date("2024-01-27"),
    subtotal: 2200,
    landedCost: 0,
    totalAmount: 2200,
    items: [
      { id: "1", product: "USB-C Fast Charger 65W", sku: "ACC-USBC-65W", orderedQty: 100, receivedQty: 100, unitCost: 22, batchNumber: "BATCH-2024-01", expiryDate: new Date("2026-01-27"), variance: 0 },
    ],
    landedCosts: [],
  },
  {
    id: "4",
    grnNumber: "GRN-2024-0004",
    poNumber: "PO-2024-0020",
    supplier: "Logitech International",
    branch: "Main Branch",
    status: "completed",
    invoiceNumber: "LOG-2024-5678",
    invoiceDate: new Date("2024-01-28"),
    receivedDate: new Date("2024-01-30"),
    subtotal: 4500,
    landedCost: 220,
    totalAmount: 4720,
    items: [
      { id: "1", product: "Logitech MX Master 3S", sku: "LOG-MX-M3S", orderedQty: 30, receivedQty: 30, unitCost: 69, variance: 0 },
      { id: "2", product: "Logitech C920 HD Webcam", sku: "LOG-C920-HD", orderedQty: 25, receivedQty: 25, unitCost: 49, variance: 0 },
    ],
    landedCosts: [
      { id: "1", type: "shipping", description: "Express Delivery", amount: 180 },
      { id: "2", type: "insurance", description: "Cargo Insurance", amount: 40 },
    ],
  },
  {
    id: "5",
    grnNumber: "GRN-2024-0005",
    poNumber: "PO-2024-0023",
    supplier: "Anker Innovations",
    branch: "Downtown Store",
    status: "verified",
    invoiceNumber: "ANK-INV-9012",
    invoiceDate: new Date("2024-02-01"),
    receivedDate: new Date("2024-02-03"),
    subtotal: 3500,
    landedCost: 150,
    totalAmount: 3650,
    items: [
      { id: "1", product: "Anker PowerCore 20000mAh", sku: "ANK-PWR-20K", orderedQty: 50, receivedQty: 48, unitCost: 35, batchNumber: "ANK-B2024-02", variance: -2 },
      { id: "2", product: "USB Hub 7-Port", sku: "ANK-HUB-7P", orderedQty: 40, receivedQty: 40, unitCost: 29, variance: 0 },
    ],
    landedCosts: [
      { id: "1", type: "shipping", description: "Standard Shipping", amount: 150 },
    ],
  },
  {
    id: "6",
    grnNumber: "GRN-2024-0006",
    poNumber: "PO-2024-0025",
    supplier: "Sony Corporation",
    branch: "Warehouse",
    status: "pending",
    invoiceNumber: "SONY-2024-3456",
    invoiceDate: new Date("2024-02-05"),
    receivedDate: new Date("2024-02-07"),
    subtotal: 14950,
    landedCost: 0,
    totalAmount: 14950,
    items: [
      { id: "1", product: "Sony WH-1000XM5 Headphones", sku: "SONY-WH1000", orderedQty: 50, receivedQty: 50, unitCost: 299, variance: 0 },
    ],
    landedCosts: [],
  },
  {
    id: "7",
    grnNumber: "GRN-2024-0007",
    poNumber: "PO-2024-0028",
    supplier: "Dell Technologies",
    branch: "Main Branch",
    status: "completed",
    invoiceNumber: "DELL-INV-7890",
    invoiceDate: new Date("2024-02-08"),
    receivedDate: new Date("2024-02-10"),
    subtotal: 25980,
    landedCost: 580,
    totalAmount: 26560,
    items: [
      { id: "1", product: "Dell XPS 15 i7", sku: "DEL-XPS15-I7", orderedQty: 15, receivedQty: 15, unitCost: 1299, variance: 0 },
      { id: "2", product: "Dell 27\" 4K Monitor", sku: "DEL-MON-27", orderedQty: 10, receivedQty: 9, unitCost: 349, variance: -1 },
    ],
    landedCosts: [
      { id: "1", type: "shipping", description: "Freight Charges", amount: 450 },
      { id: "2", type: "handling", description: "Special Handling - Fragile", amount: 130 },
    ],
  },
  {
    id: "8",
    grnNumber: "GRN-2024-0008",
    poNumber: "PO-2024-0030",
    supplier: "TP-Link Technologies",
    branch: "Downtown Store",
    status: "verified",
    invoiceNumber: "TPL-2024-1234",
    invoiceDate: new Date("2024-02-10"),
    receivedDate: new Date("2024-02-12"),
    subtotal: 4450,
    landedCost: 120,
    totalAmount: 4570,
    items: [
      { id: "1", product: "TP-Link Archer AX50 WiFi 6", sku: "TPL-WIFI6-AX", orderedQty: 35, receivedQty: 35, unitCost: 89, variance: 0 },
      { id: "2", product: "TP-Link Mesh System", sku: "TPL-MESH-3", orderedQty: 10, receivedQty: 10, unitCost: 129, variance: 0 },
    ],
    landedCosts: [
      { id: "1", type: "shipping", description: "Ground Shipping", amount: 120 },
    ],
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  verified: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]",
  completed: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
};

export default function GRN() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredGRNs = grns.filter((grn) => {
    const matchesSearch =
      grn.grnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grn.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grn.poNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || grn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = grns.filter((g) => g.status === "pending").length;
  const totalLandedCost = grns.reduce((sum, g) => sum + g.landedCost, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Goods Received Notes</h1>
          <p className="text-muted-foreground">Manage goods receipts and landed costs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New GRN
          </Button>
        </div>
      </div>

      <CreateGRNDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

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
            <p className="text-2xl font-bold">${grns.reduce((s, g) => s + g.totalAmount, 0).toFixed(2)}</p>
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
                          <DialogTrigger asChild onClick={() => setSelectedGRN(grn)}>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DialogTrigger>
                          {grn.status === "pending" && (
                            <DropdownMenuItem>
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
                                            <p className="text-xs text-muted-foreground">Batch: {item.batchNumber}</p>
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
                                            {item.variance > 0 ? "+" : ""}{item.variance}
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
                                        <TableCell className="text-right font-medium">${cost.amount.toFixed(2)}</TableCell>
                                      </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/50">
                                      <TableCell colSpan={2} className="font-medium">Total Landed Cost</TableCell>
                                      <TableCell className="text-right font-bold">${selectedGRN.landedCost.toFixed(2)}</TableCell>
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
