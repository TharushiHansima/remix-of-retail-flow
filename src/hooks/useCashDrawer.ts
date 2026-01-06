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
    recordSale: recordSaleMutation.mutateAsync,
    recordRefund: recordRefundMutation.mutateAsync,
    isRecordingSale: recordSaleMutation.isPending,
  };
}
