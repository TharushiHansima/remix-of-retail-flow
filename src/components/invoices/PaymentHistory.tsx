import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Banknote, Building2, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useConfig } from "@/contexts/ConfigContext";
import { format } from "date-fns";

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  reference: string | null;
  created_at: string;
  created_by: string | null;
}

const methodIcons: Record<string, React.ReactNode> = {
  cash: <Banknote className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
  bank_transfer: <Building2 className="h-4 w-4" />,
  mobile_money: <Smartphone className="h-4 w-4" />,
};

const methodLabels: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  bank_transfer: "Bank Transfer",
  mobile_money: "Mobile Money",
};

interface PaymentHistoryProps {
  invoiceId: string;
  refreshTrigger?: number;
}

export function PaymentHistory({ invoiceId, refreshTrigger }: PaymentHistoryProps) {
  const { formatCurrency } = useConfig();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data, error } = await supabase
          .from("payments")
          .select("*")
          .eq("invoice_id", invoiceId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPayments(data || []);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [invoiceId, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No payments recorded yet
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell className="text-sm">
              {format(new Date(payment.created_at), "MMM dd, yyyy HH:mm")}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {methodIcons[payment.payment_method] || <CreditCard className="h-4 w-4" />}
                <span>{methodLabels[payment.payment_method] || payment.payment_method}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {payment.reference || "-"}
            </TableCell>
            <TableCell className="text-right font-medium text-[hsl(var(--success))]">
              {formatCurrency(payment.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
