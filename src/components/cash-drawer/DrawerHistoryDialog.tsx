import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  created_at: string;
}

export function DrawerHistoryDialog({ open, onOpenChange }: DrawerHistoryDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDrawer, setSelectedDrawer] = useState<CashDrawer | null>(null);

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: drawers = [], isLoading } = useQuery({
    queryKey: ["drawer-history", selectedDate.toDateString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_drawers")
        .select("*")
        .gte("opened_at", startOfDay.toISOString())
        .lte("opened_at", endOfDay.toISOString())
        .order("opened_at", { ascending: false });
      
      if (error) throw error;
      return data as CashDrawer[];
    },
    enabled: open,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["drawer-detail-transactions", selectedDrawer?.id],
    queryFn: async () => {
      if (!selectedDrawer?.id) return [];
      const { data, error } = await supabase
        .from("cash_transactions")
        .select("*")
        .eq("drawer_id", selectedDrawer.id)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data as CashTransaction[];
    },
    enabled: !!selectedDrawer?.id,
  });

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Cash Drawer History</DialogTitle>
          <DialogDescription>
            View historical drawer sessions and transactions
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 items-center py-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <ScrollArea className="h-[500px]">
          {selectedDrawer ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setSelectedDrawer(null)}>
                  ← Back to list
                </Button>
                <div className="text-sm text-muted-foreground">
                  Session: {format(new Date(selectedDrawer.opened_at), "PPpp")}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Opening Float</div>
                  <div className="font-semibold">${selectedDrawer.opening_float.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Expected Closing</div>
                  <div className="font-semibold">
                    {selectedDrawer.expected_closing != null ? `$${selectedDrawer.expected_closing.toFixed(2)}` : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Actual Closing</div>
                  <div className="font-semibold">
                    {selectedDrawer.actual_closing != null ? `$${selectedDrawer.actual_closing.toFixed(2)}` : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Variance</div>
                  <div className={cn(
                    "font-semibold",
                    selectedDrawer.variance != null && selectedDrawer.variance !== 0 && "text-red-600"
                  )}>
                    {selectedDrawer.variance != null ? (
                      `${selectedDrawer.variance >= 0 ? "+" : ""}$${selectedDrawer.variance.toFixed(2)}`
                    ) : "-"}
                  </div>
                </div>
              </div>

              {selectedDrawer.notes && (
                <div className="bg-muted/50 p-3 rounded text-sm">
                  <span className="font-medium">Notes:</span> {selectedDrawer.notes}
                </div>
              )}

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
                        No transactions in this session
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{format(new Date(tx.created_at), "HH:mm:ss")}</TableCell>
                        <TableCell className="capitalize">{tx.transaction_type.replace("_", " ")}</TableCell>
                        <TableCell>{tx.reason}</TableCell>
                        <TableCell>{tx.reference || "-"}</TableCell>
                        <TableCell className={cn(
                          "text-right font-medium",
                          tx.transaction_type === "cash_in" || tx.transaction_type === "sale"
                            ? "text-green-600"
                            : "text-red-600"
                        )}>
                          {tx.transaction_type === "cash_in" || tx.transaction_type === "sale" ? "+" : "-"}
                          ${tx.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opened</TableHead>
                  <TableHead>Closed</TableHead>
                  <TableHead>Opening Float</TableHead>
                  <TableHead>Closing</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : drawers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No drawer sessions on this date
                    </TableCell>
                  </TableRow>
                ) : (
                  drawers.map((drawer) => (
                    <TableRow key={drawer.id}>
                      <TableCell>{format(new Date(drawer.opened_at), "HH:mm")}</TableCell>
                      <TableCell>
                        {drawer.closed_at ? format(new Date(drawer.closed_at), "HH:mm") : "-"}
                      </TableCell>
                      <TableCell>${drawer.opening_float.toFixed(2)}</TableCell>
                      <TableCell>
                        {drawer.actual_closing != null ? `$${drawer.actual_closing.toFixed(2)}` : "-"}
                      </TableCell>
                      <TableCell>
                        {drawer.variance != null ? (
                          <span className={drawer.variance !== 0 ? "text-red-600" : "text-green-600"}>
                            {drawer.variance >= 0 ? "+" : ""}${drawer.variance.toFixed(2)}
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(drawer.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDrawer(drawer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
