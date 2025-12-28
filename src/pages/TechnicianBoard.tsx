import { useState } from "react";
import {
  Smartphone,
  User,
  Clock,
  AlertTriangle,
  Package,
  GripVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface JobCard {
  id: string;
  jobNumber: string;
  customer: string;
  device: string;
  issue: string;
  priority: "low" | "normal" | "high" | "urgent";
  warranty: boolean;
  technician: string;
  partsWaiting?: boolean;
  slaHours: number;
  hoursElapsed: number;
}

const columns = [
  { id: "received", title: "Received", color: "bg-muted" },
  { id: "diagnosing", title: "Diagnosing", color: "bg-[hsl(var(--info))]/20" },
  { id: "waiting_parts", title: "Waiting Parts", color: "bg-[hsl(var(--warning))]/20" },
  { id: "repairing", title: "Repairing", color: "bg-[hsl(var(--chart-3))]/20" },
  { id: "testing", title: "Testing", color: "bg-[hsl(var(--chart-2))]/20" },
  { id: "completed", title: "Completed", color: "bg-[hsl(var(--success))]/20" },
];

const jobCards: Record<string, JobCard[]> = {
  received: [
    {
      id: "1",
      jobNumber: "JC-2024-0093",
      customer: "Lisa Anderson",
      device: "MacBook Air M2",
      issue: "Keyboard keys not responding",
      priority: "normal",
      warranty: true,
      technician: "",
      slaHours: 72,
      hoursElapsed: 4,
    },
  ],
  diagnosing: [
    {
      id: "2",
      jobNumber: "JC-2024-0092",
      customer: "John Smith",
      device: "MacBook Pro 14\"",
      issue: "Screen flickering",
      priority: "high",
      warranty: false,
      technician: "Mike Johnson",
      slaHours: 48,
      hoursElapsed: 24,
    },
  ],
  waiting_parts: [
    {
      id: "3",
      jobNumber: "JC-2024-0091",
      customer: "Sarah Davis",
      device: "iPhone 15 Pro Max",
      issue: "Battery replacement",
      priority: "normal",
      warranty: true,
      technician: "Alex Chen",
      partsWaiting: true,
      slaHours: 72,
      hoursElapsed: 48,
    },
  ],
  repairing: [
    {
      id: "4",
      jobNumber: "JC-2024-0090",
      customer: "Michael Brown",
      device: "Galaxy S24 Ultra",
      issue: "Screen replacement",
      priority: "urgent",
      warranty: false,
      technician: "Mike Johnson",
      slaHours: 24,
      hoursElapsed: 20,
    },
    {
      id: "5",
      jobNumber: "JC-2024-0087",
      customer: "Emma Wilson",
      device: "iPad Pro 12.9\"",
      issue: "Charging port repair",
      priority: "normal",
      warranty: false,
      technician: "Alex Chen",
      slaHours: 48,
      hoursElapsed: 12,
    },
  ],
  testing: [
    {
      id: "6",
      jobNumber: "JC-2024-0089",
      customer: "Emily Wilson",
      device: "iPad Pro 12.9\"",
      issue: "Charging port not working",
      priority: "normal",
      warranty: false,
      technician: "Alex Chen",
      slaHours: 48,
      hoursElapsed: 44,
    },
  ],
  completed: [
    {
      id: "7",
      jobNumber: "JC-2024-0088",
      customer: "David Lee",
      device: "iPhone 14 Pro",
      issue: "Battery replacement",
      priority: "low",
      warranty: false,
      technician: "Mike Johnson",
      slaHours: 72,
      hoursElapsed: 36,
    },
  ],
};

const priorityColors = {
  low: "border-l-muted-foreground",
  normal: "border-l-[hsl(var(--info))]",
  high: "border-l-[hsl(var(--warning))]",
  urgent: "border-l-destructive",
};

export default function TechnicianBoard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Technician Board</h1>
        <p className="text-muted-foreground">Kanban view of all repair jobs</p>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 bg-card rounded-lg border border-border"
          >
            {/* Column Header */}
            <div
              className={cn(
                "px-4 py-3 border-b border-border rounded-t-lg",
                column.color
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-card-foreground">{column.title}</h3>
                <Badge variant="secondary">{jobCards[column.id]?.length || 0}</Badge>
              </div>
            </div>

            {/* Cards */}
            <div className="p-3 space-y-3 min-h-[500px]">
              {jobCards[column.id]?.map((job) => {
                const slaPercentage = (job.hoursElapsed / job.slaHours) * 100;
                const isOverdue = slaPercentage >= 100;
                const isWarning = slaPercentage >= 75 && slaPercentage < 100;

                return (
                  <div
                    key={job.id}
                    className={cn(
                      "bg-background rounded-lg border border-border p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow border-l-4",
                      priorityColors[job.priority]
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-bold text-sm text-card-foreground">
                        {job.jobNumber}
                      </span>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    </div>

                    {/* Device */}
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-card-foreground truncate">
                        {job.device}
                      </span>
                    </div>

                    {/* Issue */}
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {job.issue}
                    </p>

                    {/* Customer */}
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{job.customer}</span>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.warranty && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30"
                        >
                          Warranty
                        </Badge>
                      )}
                      {job.partsWaiting && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30 gap-1"
                        >
                          <Package className="h-3 w-3" />
                          Parts
                        </Badge>
                      )}
                      {job.priority === "urgent" && (
                        <Badge className="text-xs bg-destructive/10 text-destructive gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Urgent
                        </Badge>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      {/* Technician */}
                      {job.technician ? (
                        <div className="flex items-center gap-1">
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-[10px] text-primary-foreground">
                              {job.technician
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {job.technician.split(" ")[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Unassigned
                        </span>
                      )}

                      {/* SLA Timer */}
                      <div
                        className={cn(
                          "flex items-center gap-1 text-xs",
                          isOverdue && "text-destructive",
                          isWarning && "text-[hsl(var(--warning))]",
                          !isOverdue && !isWarning && "text-muted-foreground"
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        <span>
                          {job.hoursElapsed}h / {job.slaHours}h
                        </span>
                      </div>
                    </div>

                    {/* SLA Progress Bar */}
                    <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          isOverdue && "bg-destructive",
                          isWarning && "bg-[hsl(var(--warning))]",
                          !isOverdue && !isWarning && "bg-[hsl(var(--success))]"
                        )}
                        style={{ width: `${Math.min(slaPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
