import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  User,
  Smartphone,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Estimate {
  id: string;
  estimateNumber: string;
  customer: string;
  phone: string;
  email?: string;
  device: string;
  issue: string;
  status: "draft" | "sent" | "approved" | "rejected" | "expired";
  laborCost: number;
  partsCost: number;
  totalCost: number;
  validUntil: string;
  createdAt: string;
  jobCardId?: string;
  items?: { description: string; type: string; quantity: number; unitPrice: number }[];
}

interface ViewEstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: Estimate | null;
}

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  sent: { label: "Sent", color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]", icon: Send },
  approved: { label: "Approved", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: XCircle },
  expired: { label: "Expired", color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]", icon: Clock },
};

export function ViewEstimateDialog({ open, onOpenChange, estimate }: ViewEstimateDialogProps) {
  if (!estimate) return null;

  const StatusIcon = statusConfig[estimate.status].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{estimate.estimateNumber}</DialogTitle>
              <DialogDescription>Estimate details and breakdown</DialogDescription>
            </div>
            <Badge className={cn("gap-1", statusConfig[estimate.status].color)}>
              <StatusIcon className="h-3 w-3" />
              {statusConfig[estimate.status].label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Customer Name</p>
                  <p className="text-sm font-medium text-foreground">{estimate.customer}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">{estimate.phone || "N/A"}</p>
                </div>
              </div>
              {estimate.email && (
                <div className="flex items-center gap-2 col-span-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground">{estimate.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Device & Issue */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Device & Issue</h3>
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Device</p>
                  <p className="text-sm font-medium text-foreground">{estimate.device}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Issue Description</p>
                <p className="text-sm text-foreground">{estimate.issue}</p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Cost Breakdown</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Labor Cost</p>
                  <p className="text-lg font-medium text-foreground">${estimate.laborCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Parts Cost</p>
                  <p className="text-lg font-medium text-foreground">${estimate.partsCost.toFixed(2)}</p>
                </div>
              </div>
              <Separator />
              <div className="p-4 bg-muted/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Grand Total</span>
                  <span className="text-xl font-bold text-foreground">${estimate.totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Created On</p>
                <p className="text-sm font-medium text-foreground">{estimate.createdAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Valid Until</p>
                <p className="text-sm font-medium text-foreground">{estimate.validUntil}</p>
              </div>
            </div>
          </div>

          {estimate.jobCardId && (
            <div className="p-3 bg-[hsl(var(--success))]/10 rounded-lg">
              <p className="text-sm text-[hsl(var(--success))]">
                Linked to Job Card: <span className="font-medium">{estimate.jobCardId}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
