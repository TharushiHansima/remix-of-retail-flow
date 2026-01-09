import { ReactNode } from "react";
import { Package, Search, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateVariant = "no-data" | "no-results" | "error";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const defaultConfig: Record<EmptyStateVariant, { icon: ReactNode; title: string; description: string }> = {
  "no-data": {
    icon: <Package className="h-12 w-12 text-muted-foreground" />,
    title: "No data yet",
    description: "Get started by adding your first item.",
  },
  "no-results": {
    icon: <Search className="h-12 w-12 text-muted-foreground" />,
    title: "No results found",
    description: "Try adjusting your search or filter criteria.",
  },
  "error": {
    icon: <FileX className="h-12 w-12 text-destructive" />,
    title: "Something went wrong",
    description: "Failed to load data. Please try again.",
  },
};

export function EmptyState({
  variant = "no-data",
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  const config = defaultConfig[variant];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">
        {icon || config.icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {title || config.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {description || config.description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
