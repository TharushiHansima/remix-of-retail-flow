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
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Smartphone,
  Calendar,
  Phone,
  Mail,
  Hash,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WarrantyJob {
  id: string;
  jobNumber: string;
  customer: string;
  phone: string;
  email?: string;
  device: string;
  serialNumber: string;
  issue: string;
  status: "pending" | "in_progress" | "approved" | "rejected" | "completed";
  warrantyType: "manufacturer" | "extended" | "store";
  warrantyExpiry: string;
  purchaseDate: string;
  claimStatus: "pending" | "submitted" | "approved" | "rejected";
  claimAmount?: number;
  createdAt: string;
  technician?: string;
  notes?: string;
}

interface ViewWarrantyJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: WarrantyJob | null;
}

const statusConfig = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]", icon: Clock },
  approved: { label: "Approved", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: XCircle },
  completed: { label: "Completed", color: "bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]", icon: CheckCircle2 },
};

const claimStatusConfig = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]" },
  approved: { label: "Approved", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive" },
};

const warrantyTypeConfig = {
  manufacturer: { label: "Manufacturer", color: "bg-[hsl(var(--chart-1))]/10 text-[hsl(var(--chart-1))]" },
  extended: { label: "Extended", color: "bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]" },
  store: { label: "Store", color: "bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]" },
};

export function ViewWarrantyJobDialog({ open, onOpenChange, job }: ViewWarrantyJobDialogProps) {
  if (!job) return null;

  const StatusIcon = statusConfig[job.status].icon;
  const isExpired = new Date(job.warrantyExpiry) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{job.jobNumber}</DialogTitle>
              <DialogDescription>Warranty job details</DialogDescription>
            </div>
            <Badge className={cn("gap-1", statusConfig[job.status].color)}>
              <StatusIcon className="h-3 w-3" />
              {statusConfig[job.status].label}
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
                  <p className="text-sm font-medium text-foreground">{job.customer}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">{job.phone}</p>
                </div>
              </div>
              {job.email && (
                <div className="flex items-center gap-2 col-span-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground">{job.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Device Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Device Information</h3>
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Device</p>
                    <p className="text-sm font-medium text-foreground">{job.device}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Serial Number</p>
                    <p className="text-sm font-medium font-mono text-foreground">{job.serialNumber}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Issue Description</p>
                <p className="text-sm text-foreground">{job.issue}</p>
              </div>
            </div>
          </div>

          {/* Warranty Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Warranty Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Warranty Type</p>
                </div>
                <Badge className={warrantyTypeConfig[job.warrantyType].color}>
                  {warrantyTypeConfig[job.warrantyType].label}
                </Badge>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Warranty Expiry</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-medium",
                    isExpired ? "text-destructive" : "text-foreground"
                  )}>
                    {job.warrantyExpiry}
                  </span>
                  {isExpired && <AlertTriangle className="h-4 w-4 text-destructive" />}
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Purchase Date</p>
                <p className="text-sm font-medium text-foreground">{job.purchaseDate}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Claim Status</p>
                <Badge className={claimStatusConfig[job.claimStatus].color}>
                  {claimStatusConfig[job.claimStatus].label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Claim Amount */}
          {job.claimAmount && (
            <div className="p-4 bg-[hsl(var(--success))]/10 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Approved Claim Amount</p>
              <p className="text-2xl font-bold text-[hsl(var(--success))]">${job.claimAmount.toFixed(2)}</p>
            </div>
          )}

          {/* Technician */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Assigned Technician</p>
              <p className="text-sm font-medium text-foreground">
                {job.technician || "Unassigned"}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Created On</p>
              <p className="text-sm font-medium text-foreground">{job.createdAt}</p>
            </div>
          </div>

          {job.notes && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground">{job.notes}</p>
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
