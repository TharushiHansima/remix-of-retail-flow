import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, X } from "lucide-react";
import type { ApprovalRule } from "@/config/types";

interface ApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: ApprovalRule[];
  entityType: string;
  onApprove: (comment: string) => void;
  onReject: (comment: string) => void;
  title?: string;
}

export function ApprovalModal({ 
  open, 
  onOpenChange, 
  rules, 
  entityType,
  onApprove, 
  onReject,
  title = "Approval Required"
}: ApprovalModalProps) {
  const [comment, setComment] = useState("");

  const handleApprove = () => {
    onApprove(comment);
    setComment("");
    onOpenChange(false);
  };

  const handleReject = () => {
    onReject(comment);
    setComment("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {title}
          </DialogTitle>
          <DialogDescription>
            This {entityType.replace('_', ' ')} requires approval based on the following rules:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            {rules.map(rule => (
              <div key={rule.id} className="p-3 rounded-lg border bg-muted/50">
                <p className="font-medium text-sm">{rule.name}</p>
                <p className="text-xs text-muted-foreground">{rule.description}</p>
                <div className="mt-2 flex gap-1">
                  {rule.approverRoles.map(role => (
                    <Badge key={role} variant="secondary" className="text-xs">{role}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment for the approval..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="destructive" onClick={handleReject}>
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button onClick={handleApprove}>
            <Check className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
