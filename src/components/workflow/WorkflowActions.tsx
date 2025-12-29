import { Button } from "@/components/ui/button";
import { useConfig } from "@/contexts/ConfigContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ArrowRight, Lock } from "lucide-react";
import type { WorkflowTransition } from "@/config/types";

interface WorkflowActionsProps {
  entityType: string;
  currentStatus: string;
  onTransition: (toStatus: string, transition: WorkflowTransition) => void;
  disabled?: boolean;
}

export function WorkflowActions({ entityType, currentStatus, onTransition, disabled }: WorkflowActionsProps) {
  const { getValidTransitions, getWorkflow } = useConfig();
  const { roles } = useAuth();
  
  const userRoles = roles.map(r => r.role);
  const validTransitions = getValidTransitions(entityType, currentStatus, userRoles);
  const workflow = getWorkflow(entityType);

  if (!workflow || validTransitions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {validTransitions.map((transition, idx) => {
        const toStatus = workflow.statuses.find(s => s.id === transition.to);
        const needsApproval = transition.requiresApproval;
        
        return (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onTransition(transition.to, transition)}
            className={cn(
              "gap-2",
              toStatus?.color.replace('bg-', 'hover:bg-').replace('-500', '-100')
            )}
          >
            {transition.label}
            {needsApproval ? (
              <Lock className="h-3 w-3" />
            ) : (
              <ArrowRight className="h-3 w-3" />
            )}
          </Button>
        );
      })}
    </div>
  );
}
