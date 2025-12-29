import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { WorkflowDefinition } from "@/config/types";

interface WorkflowStepperProps {
  workflow: WorkflowDefinition;
  currentStatus: string;
  showAll?: boolean;
  compact?: boolean;
}

export function WorkflowStepper({ workflow, currentStatus, showAll = false, compact = false }: WorkflowStepperProps) {
  const sortedStatuses = [...workflow.statuses].sort((a, b) => a.order - b.order);
  const currentIndex = sortedStatuses.findIndex(s => s.id === currentStatus);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {sortedStatuses.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = status.id === currentStatus;
          
          return (
            <div key={status.id} className="flex items-center">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isCompleted && "bg-green-500",
                  isCurrent && status.color,
                  !isCompleted && !isCurrent && "bg-muted"
                )}
                title={status.name}
              />
              {index < sortedStatuses.length - 1 && (
                <div className={cn(
                  "w-3 h-0.5 mx-0.5",
                  isCompleted ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {sortedStatuses.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = status.id === currentStatus;
        const isUpcoming = index > currentIndex;
        
        return (
          <div key={status.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                  isCompleted && "bg-green-500 text-white",
                  isCurrent && `${status.color} text-white ring-2 ring-offset-2 ring-primary`,
                  isUpcoming && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={cn(
                "text-xs mt-1 whitespace-nowrap",
                isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
              )}>
                {status.name}
              </span>
            </div>
            {index < sortedStatuses.length - 1 && (
              <div className={cn(
                "w-8 h-0.5 mx-1",
                isCompleted ? "bg-green-500" : "bg-muted"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
