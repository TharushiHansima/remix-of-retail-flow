import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface Approval {
  id: string;
  entity_type: string;
  entity_id: string;
  rule_id: string;
  rule_name: string;
  requested_by: string | null;
  requested_at: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  comment: string | null;
  metadata: Json;
  created_at: string;
  requester_profile?: {
    full_name: string | null;
    email: string;
  } | null;
}

export function useApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchApprovals = async () => {
    try {
      // Fetch approvals first
      const { data: approvalsData, error: approvalsError } = await supabase
        .from("approvals")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (approvalsError) throw approvalsError;

      // Fetch requester profiles
      const userIds = [...new Set(approvalsData?.map(a => a.requested_by).filter(Boolean))];
      let profilesMap: Record<string, { full_name: string | null; email: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", userIds);
        
        profiles?.forEach(p => {
          profilesMap[p.user_id] = { full_name: p.full_name, email: p.email };
        });
      }

      const enrichedApprovals = approvalsData?.map(a => ({
        ...a,
        requester_profile: a.requested_by ? profilesMap[a.requested_by] : null
      })) || [];

      setApprovals(enrichedApprovals);
    } catch (error) {
      console.error("Error fetching approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id: string, comment?: string) => {
    try {
      const { error } = await supabase
        .from("approvals")
        .update({
          status: "approved",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          comment: comment || null,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Request approved");
      fetchApprovals();
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    }
  };

  const rejectRequest = async (id: string, comment?: string) => {
    try {
      const { error } = await supabase
        .from("approvals")
        .update({
          status: "rejected",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          comment: comment || null,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Request rejected");
      fetchApprovals();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  const createApprovalRequest = async (
    entityType: string,
    entityId: string,
    ruleId: string,
    ruleName: string,
    metadata: Record<string, unknown> = {}
  ) => {
    try {
      const { error } = await supabase.from("approvals").insert({
        entity_type: entityType,
        entity_id: entityId,
        rule_id: ruleId,
        rule_name: ruleName,
        requested_by: user?.id,
        metadata: metadata as Json,
      });

      if (error) throw error;
      toast.success("Approval request submitted");
    } catch (error) {
      console.error("Error creating approval request:", error);
      toast.error("Failed to submit approval request");
    }
  };

  useEffect(() => {
    fetchApprovals();

    // Set up real-time subscription
    const channel = supabase
      .channel("approvals-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "approvals",
        },
        (payload) => {
          console.log("Approval change:", payload);
          fetchApprovals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    approvals,
    loading,
    approveRequest,
    rejectRequest,
    createApprovalRequest,
    refetch: fetchApprovals,
  };
}
