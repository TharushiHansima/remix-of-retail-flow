import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  User,
  Smartphone,
  Phone,
  Mail,
  Calendar,
  Wrench,
  CheckCircle2,
  Play,
  Pause,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JobCard {
  id: string;
  jobNumber: string;
  customer: string;
  phone: string;
  device: string;
  serialNumber: string;
  issue: string;
  status: "received" | "diagnosing" | "waiting_parts" | "repairing" | "testing" | "completed";
  priority: "low" | "normal" | "high" | "urgent";
  warranty: boolean;
  technician?: string;
  createdAt: string;
  dueDate: string;
  slaHours: number;
}

const statusConfig = {
  received: { label: "Received", color: "bg-muted text-muted-foreground", icon: Clock },
  diagnosing: { label: "Diagnosing", color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]", icon: Play },
  waiting_parts: { label: "Waiting Parts", color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]", icon: Pause },
  repairing: { label: "Repairing", color: "bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]", icon: Play },
  testing: { label: "Testing", color: "bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]", icon: Play },
  completed: { label: "Completed", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", icon: CheckCircle2 },
};

const priorityConfig = {
  low: { label: "Low", color: "bg-muted text-muted-foreground" },
  normal: { label: "Normal", color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]" },
  high: { label: "High", color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]" },
  urgent: { label: "Urgent", color: "bg-destructive/10 text-destructive" },
};

interface ViewJobCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobCard | null;
}

export function ViewJobCardDialog({ open, onOpenChange, job }: ViewJobCardDialogProps) {
  if (!job) return null;

  const StatusIcon = statusConfig[job.status].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{job.jobNumber}</DialogTitle>
              <DialogDescription>Job card details and status</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn("gap-1", statusConfig[job.status].color)}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig[job.status].label}
              </Badge>
              <Badge className={priorityConfig[job.priority].color}>
                {priorityConfig[job.priority].label} Priority
              </Badge>
              {job.warranty && (
                <Badge variant="outline" className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30">
                  Warranty
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium text-foreground">{job.customer}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium text-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {job.phone}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Device Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Device Information
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Device</p>
                <p className="text-sm font-medium text-foreground">{job.device}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Serial Number</p>
                <p className="text-sm font-medium font-mono text-foreground">{job.serialNumber}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Issue Description</p>
                <p className="text-sm text-foreground mt-1">{job.issue}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Job Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Job Details
            </h3>
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Created Date</p>
                <p className="text-sm font-medium text-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {job.createdAt}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="text-sm font-medium text-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {job.dueDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">SLA Hours</p>
                <p className="text-sm font-medium text-foreground">{job.slaHours}h</p>
              </div>
              <div className="col-span-3">
                <p className="text-xs text-muted-foreground">Assigned Technician</p>
                <p className="text-sm font-medium text-foreground">
                  {job.technician || <span className="italic text-muted-foreground">Unassigned</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
