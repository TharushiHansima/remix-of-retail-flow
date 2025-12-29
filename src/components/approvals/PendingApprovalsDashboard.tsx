import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Clock, FileText, Package, ShoppingCart, Receipt, RefreshCw } from "lucide-react";
import { useApprovals, Approval } from "@/hooks/useApprovals";
import { useConfig } from "@/contexts/ConfigContext";
import { formatDistanceToNow } from "date-fns";
import type { Json } from "@/integrations/supabase/types";

const entityIcons: Record<string, React.ReactNode> = {
  purchase_order: <ShoppingCart className="h-4 w-4" />,
  stock_adjustment: <Package className="h-4 w-4" />,
  invoice: <Receipt className="h-4 w-4" />,
  discount: <FileText className="h-4 w-4" />,
};

const entityLabels: Record<string, string> = {
  purchase_order: "Purchase Order",
  stock_adjustment: "Stock Adjustment",
  invoice: "Invoice",
  discount: "Discount Override",
};

export function PendingApprovalsDashboard() {
  const { approvals, loading, approveRequest, rejectRequest, refetch } = useApprovals();
  const { formatCurrency } = useConfig();
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");

  const handleAction = async () => {
    if (!selectedApproval || !actionType) return;
    
    if (actionType === "approve") {
      await approveRequest(selectedApproval.id, comment);
    } else {
      await rejectRequest(selectedApproval.id, comment);
    }
    
    setSelectedApproval(null);
    setActionType(null);
    setComment("");
  };

  const openActionDialog = (approval: Approval, action: "approve" | "reject") => {
    setSelectedApproval(approval);
    setActionType(action);
    setComment("");
  };

  const renderMetadata = (approval: Approval) => {
    const metadata = approval.metadata as Record<string, Json> | null;
    if (!metadata || typeof metadata !== 'object') return null;

    return (
      <div className="text-xs text-muted-foreground mt-1">
        {metadata.amount !== undefined && (
          <span className="mr-3">Amount: {formatCurrency(Number(metadata.amount))}</span>
        )}
        {metadata.discount_percent !== undefined && (
          <span className="mr-3">Discount: {String(metadata.discount_percent)}%</span>
        )}
        {metadata.quantity !== undefined && (
          <span>Qty: {String(metadata.quantity)}</span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Items awaiting your review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Pending Approvals
              {approvals.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {approvals.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Items awaiting manager/admin review</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Check className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p>No pending approvals</p>
              <p className="text-sm">All caught up!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Rule</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {entityIcons[approval.entity_type] || <FileText className="h-4 w-4" />}
                        <span className="font-medium">
                          {entityLabels[approval.entity_type] || approval.entity_type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{approval.rule_name}</p>
                        {renderMetadata(approval)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {approval.requester_profile?.full_name || 
                       approval.requester_profile?.email || 
                       "Unknown"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => openActionDialog(approval, "reject")}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openActionDialog(approval, "approve")}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedApproval && !!actionType} onOpenChange={() => {
        setSelectedApproval(null);
        setActionType(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Request" : "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" 
                ? "Confirm approval of this request"
                : "Please provide a reason for rejection"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApproval && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg border bg-muted/50">
                <p className="font-medium">{selectedApproval.rule_name}</p>
                <p className="text-sm text-muted-foreground">
                  {entityLabels[selectedApproval.entity_type] || selectedApproval.entity_type}
                </p>
                {renderMetadata(selectedApproval)}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comment">
                  Comment {actionType === "reject" ? "(recommended)" : "(optional)"}
                </Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={actionType === "approve" 
                    ? "Add approval notes..." 
                    : "Reason for rejection..."}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedApproval(null);
              setActionType(null);
            }}>
              Cancel
            </Button>
            <Button
              variant={actionType === "reject" ? "destructive" : "default"}
              onClick={handleAction}
            >
              {actionType === "approve" ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Approval
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
