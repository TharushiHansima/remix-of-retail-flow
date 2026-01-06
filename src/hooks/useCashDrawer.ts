import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
}

export function useCashDrawer() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch active drawer for current user
  const { data: activeDrawer, isLoading } = useQuery({
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

  // Fetch transactions for the active drawer to calculate balance
  const { data: transactions } = useQuery({
    queryKey: ["drawer-transactions", activeDrawer?.id],
    queryFn: async () => {
      if (!activeDrawer?.id) return [];
      
      const { data, error } = await supabase
        .from("cash_transactions")
        .select("id, drawer_id, transaction_type, amount")
        .eq("drawer_id", activeDrawer.id);

      if (error) throw error;
      return data as CashTransaction[];
    },
    enabled: !!activeDrawer?.id,
  });

  // Calculate drawer balance
  const drawerBalance = activeDrawer
    ? (transactions || []).reduce((balance, tx) => {
        if (tx.transaction_type === "sale" || tx.transaction_type === "cash_in") {
          return balance + Number(tx.amount);
        } else if (tx.transaction_type === "refund" || tx.transaction_type === "cash_out") {
          return balance - Number(tx.amount);
        }
        return balance;
      }, Number(activeDrawer.opening_float))
    : 0;

  // Record a sale transaction
  const recordSaleMutation = useMutation({
    mutationFn: async ({
      amount,
      invoiceNumber,
      paymentMethod,
    }: {
      amount: number;
      invoiceNumber: string;
      paymentMethod: string;
    }) => {
      if (!activeDrawer) {
        throw new Error("No active cash drawer");
      }

      // Only record cash sales to the drawer
      if (paymentMethod !== "cash") {
        return null;
      }

      const { data, error } = await supabase
        .from("cash_transactions")
        .insert({
          drawer_id: activeDrawer.id,
          transaction_type: "sale",
          amount,
          reason: "POS Sale",
          reference: invoiceNumber,
          created_by: user?.id,
          requires_approval: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["drawer-transactions"] });
      }
    },
    onError: (error) => {
      console.error("Failed to record cash transaction:", error);
    },
  });

  // Record a refund transaction
  const recordRefundMutation = useMutation({
    mutationFn: async ({
      amount,
      invoiceNumber,
    }: {
      amount: number;
      invoiceNumber: string;
    }) => {
      if (!activeDrawer) {
        throw new Error("No active cash drawer");
      }

      const { data, error } = await supabase
        .from("cash_transactions")
        .insert({
          drawer_id: activeDrawer.id,
          transaction_type: "refund",
          amount,
          reason: "POS Refund",
          reference: invoiceNumber,
          created_by: user?.id,
          requires_approval: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drawer-transactions"] });
    },
    onError: (error) => {
      console.error("Failed to record refund transaction:", error);
    },
  });

  return {
    activeDrawer,
    isLoading,
    hasActiveDrawer: !!activeDrawer,
    drawerBalance,
    recordSale: recordSaleMutation.mutateAsync,
    recordRefund: recordRefundMutation.mutateAsync,
    isRecordingSale: recordSaleMutation.isPending,
  };
}
