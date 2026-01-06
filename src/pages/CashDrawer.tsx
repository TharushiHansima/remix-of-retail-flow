import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  DollarSign, 
  Plus, 
  Minus, 
  Lock, 
  Unlock, 
  History, 
  Calculator,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2
} from "lucide-react";
import { OpenDrawerDialog } from "@/components/cash-drawer/OpenDrawerDialog";
import { CloseDrawerDialog } from "@/components/cash-drawer/CloseDrawerDialog";
import { CashTransactionDialog } from "@/components/cash-drawer/CashTransactionDialog";
import { DrawerHistoryDialog } from "@/components/cash-drawer/DrawerHistoryDialog";

interface CashDrawer {
  id: string;
  branch_id: string;
  opened_by: string;
  closed_by: string | null;
  opening_float: number;
  expected_closing: number | null;
  actual_closing: number | null;
  variance: number | null;
  status: string;
  opened_at: string;
  closed_at: string | null;
  notes: string | null;
}

interface CashTransaction {
  id: string;
  drawer_id: string;
  transaction_type: string;
  amount: number;
  reason: string;
  reference: string | null;
  requires_approval: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_by: string;
  created_at: string;
}

export default function CashDrawerPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [openDrawerDialog, setOpenDrawerDialog] = useState(false);
  const [closeDrawerDialog, setCloseDrawerDialog] = useState(false);
  const [transactionDialog, setTransactionDialog] = useState<"cash_in" | "cash_out" | null>(null);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [selectedDrawer, setSelectedDrawer] = useState<CashDrawer | null>(null);

  // Fetch active drawer for current user
  const { data: activeDrawer, isLoading: loadingActive } = useQuery({
    queryKey: ["active-drawer", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_drawers")
        .select("*")
        .eq("opened_by", user?.id)
        .eq("status", "open")
        .maybeSingle();
      
      if (error) throw error;
      return data as CashDrawer | null;
    },
    enabled: !!user?.id,
  });

  // Fetch transactions for active drawer
  const { data: transactions = [] } = useQuery({
    queryKey: ["drawer-transactions", activeDrawer?.id],
    queryFn: async () => {
      if (!activeDrawer?.id) return [];
      const { data, error } = await supabase
        .from("cash_transactions")
        .select("*")
        .eq("drawer_id", activeDrawer.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as CashTransaction[];
    },
    enabled: !!activeDrawer?.id,
  });

  // Fetch recent closed drawers
  const { data: recentDrawers = [] } = useQuery({
    queryKey: ["recent-drawers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_drawers")
        .select("*")
        .neq("status", "open")
        .order("closed_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as CashDrawer[];
    },
  });

  // Calculate drawer totals
  const calculateDrawerBalance = () => {
    if (!activeDrawer) return 0;
    
    let balance = activeDrawer.opening_float;
    transactions.forEach((tx) => {
      if (tx.transaction_type === "cash_in" || tx.transaction_type === "sale") {
        balance += tx.amount;
      } else {
        balance -= tx.amount;
      }
    });
    return balance;
  };

  const cashInTotal = transactions
    .filter((tx) => tx.transaction_type === "cash_in" || tx.transaction_type === "sale")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const cashOutTotal = transactions
    .filter((tx) => tx.transaction_type === "cash_out" || tx.transaction_type === "refund")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expectedBalance = calculateDrawerBalance();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500">Open</Badge>;
      case "closed":
        return <Badge className="bg-yellow-500">Closed</Badge>;
      case "reconciled":
        return <Badge className="bg-blue-500">Reconciled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "cash_in":
      case "sale":
        return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
      case "cash_out":
      case "refund":
        return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  if (loadingActive) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cash Drawer</h1>
          <p className="text-muted-foreground">
            Manage cash drawer operations and reconciliation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setHistoryDialog(true)}>
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
          {!activeDrawer ? (
            <Button onClick={() => setOpenDrawerDialog(true)}>
              <Unlock className="mr-2 h-4 w-4" />
              Open Drawer
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => setCloseDrawerDialog(true)}>
              <Lock className="mr-2 h-4 w-4" />
              Close Drawer
            </Button>
          )}
        </div>
      </div>

      {activeDrawer ? (
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Opening Float</CardDescription>
              <CardTitle className="text-2xl">
                ${activeDrawer.opening_float.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cash In</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                +${cashInTotal.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cash Out</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                -${cashOutTotal.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Expected Balance</CardDescription>
              <CardTitle className="text-2xl">
                ${expectedBalance.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Drawer</h3>
            <p className="text-muted-foreground text-center mb-4">
              Open a cash drawer to start recording transactions
            </p>
            <Button onClick={() => setOpenDrawerDialog(true)}>
              <Unlock className="mr-2 h-4 w-4" />
              Open Drawer
            </Button>
          </CardContent>
        </Card>
      )}

      {activeDrawer && (
        <Tabs defaultValue="transactions">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={() => setTransactionDialog("cash_in")}>
                <Plus className="mr-2 h-4 w-4" />
                Cash In
              </Button>
              <Button variant="outline" onClick={() => setTransactionDialog("cash_out")}>
                <Minus className="mr-2 h-4 w-4" />
                Cash Out
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No transactions recorded yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{format(new Date(tx.created_at), "HH:mm:ss")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(tx.transaction_type)}
                            <span className="capitalize">{tx.transaction_type.replace("_", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell>{tx.reason}</TableCell>
                        <TableCell>{tx.reference || "-"}</TableCell>
                        <TableCell className={`text-right font-medium ${
                          tx.transaction_type === "cash_in" || tx.transaction_type === "sale"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                          {tx.transaction_type === "cash_in" || tx.transaction_type === "sale" ? "+" : "-"}
                          ${tx.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Drawer Summary</CardTitle>
                <CardDescription>
                  Opened at {format(new Date(activeDrawer.opened_at), "PPpp")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Opening Float:</span>
                      <span className="font-medium">${activeDrawer.opening_float.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Cash In:</span>
                      <span className="font-medium text-green-600">+${cashInTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Cash Out:</span>
                      <span className="font-medium text-red-600">-${cashOutTotal.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-semibold">Expected Balance:</span>
                      <span className="font-bold">${expectedBalance.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Transactions:</span>
                      <span className="font-medium">{transactions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cash In Count:</span>
                      <span className="font-medium">
                        {transactions.filter((tx) => tx.transaction_type === "cash_in" || tx.transaction_type === "sale").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cash Out Count:</span>
                      <span className="font-medium">
                        {transactions.filter((tx) => tx.transaction_type === "cash_out" || tx.transaction_type === "refund").length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Recent Closed Drawers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Drawer Sessions</CardTitle>
          <CardDescription>Last 10 closed drawer sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opened</TableHead>
                <TableHead>Closed</TableHead>
                <TableHead>Opening Float</TableHead>
                <TableHead>Closing Amount</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDrawers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No drawer history available
                  </TableCell>
                </TableRow>
              ) : (
                recentDrawers.map((drawer) => (
                  <TableRow key={drawer.id}>
                    <TableCell>{format(new Date(drawer.opened_at), "PPp")}</TableCell>
                    <TableCell>
                      {drawer.closed_at ? format(new Date(drawer.closed_at), "PPp") : "-"}
                    </TableCell>
                    <TableCell>${drawer.opening_float.toFixed(2)}</TableCell>
                    <TableCell>
                      {drawer.actual_closing != null ? `$${drawer.actual_closing.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>
                      {drawer.variance != null ? (
                        <span className={drawer.variance === 0 ? "text-green-600" : "text-red-600"}>
                          {drawer.variance >= 0 ? "+" : ""}${drawer.variance.toFixed(2)}
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(drawer.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <OpenDrawerDialog 
        open={openDrawerDialog} 
        onOpenChange={setOpenDrawerDialog} 
      />
      
      {activeDrawer && (
        <>
          <CloseDrawerDialog
            open={closeDrawerDialog}
            onOpenChange={setCloseDrawerDialog}
            drawer={activeDrawer}
            expectedBalance={expectedBalance}
          />
          
          <CashTransactionDialog
            open={transactionDialog !== null}
            onOpenChange={(open) => !open && setTransactionDialog(null)}
            type={transactionDialog || "cash_in"}
            drawerId={activeDrawer.id}
          />
        </>
      )}
      
      <DrawerHistoryDialog
        open={historyDialog}
        onOpenChange={setHistoryDialog}
      />
    </div>
  );
}
