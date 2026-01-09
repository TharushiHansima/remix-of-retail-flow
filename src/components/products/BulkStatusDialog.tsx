import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Power } from "lucide-react";

interface BulkStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (status: "active" | "inactive") => Promise<void>;
}

export function BulkStatusDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
}: BulkStatusDialogProps) {
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(status);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Power className="h-5 w-5" />
            Update Product Status
          </DialogTitle>
          <DialogDescription>
            Change the status for{" "}
            <Badge variant="secondary" className="mx-1">
              {selectedCount} product{selectedCount !== 1 ? "s" : ""}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label className="text-sm font-medium mb-3 block">
            Select new status
          </Label>
          <RadioGroup
            value={status}
            onValueChange={(value) => setStatus(value as "active" | "inactive")}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="active" id="status-active" />
              <Label htmlFor="status-active" className="flex-1 cursor-pointer flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />
                <div>
                  <p className="font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">
                    Products will be visible and available for sale
                  </p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="inactive" id="status-inactive" />
              <Label htmlFor="status-inactive" className="flex-1 cursor-pointer flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Inactive</p>
                  <p className="text-xs text-muted-foreground">
                    Products will be hidden from sales but retained in inventory
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Updating..." : `Update ${selectedCount} Product${selectedCount !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
