import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Estimate {
  id: string;
  estimateNumber: string;
  customer: string;
}

interface DeleteEstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: Estimate | null;
  onDelete: (id: string) => void;
}

export function DeleteEstimateDialog({ open, onOpenChange, estimate, onDelete }: DeleteEstimateDialogProps) {
  const handleDelete = () => {
    if (estimate) {
      onDelete(estimate.id);
      toast.success("Estimate deleted successfully");
      onOpenChange(false);
    }
  };

  if (!estimate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Estimate</DialogTitle>
              <DialogDescription>
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete estimate{" "}
            <span className="font-medium text-foreground">{estimate.estimateNumber}</span> for{" "}
            <span className="font-medium text-foreground">{estimate.customer}</span>?
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Estimate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
