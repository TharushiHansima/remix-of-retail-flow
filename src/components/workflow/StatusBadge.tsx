import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useConfig } from "@/contexts/ConfigContext";

interface StatusBadgeProps {
  entityType: string;
  status: string;
  className?: string;
}

export function StatusBadge({ entityType, status, className }: StatusBadgeProps) {
  const { getWorkflow } = useConfig();
  const workflow = getWorkflow(entityType);
  
  if (!workflow) {
    return <Badge variant="outline" className={className}>{status}</Badge>;
  }

  const statusConfig = workflow.statuses.find(s => s.id === status);
  
  if (!statusConfig) {
    return <Badge variant="outline" className={className}>{status}</Badge>;
  }

  return (
    <Badge 
      className={cn(
        statusConfig.color,
        "text-white border-0",
        className
      )}
    >
      {statusConfig.name}
    </Badge>
  );
}
