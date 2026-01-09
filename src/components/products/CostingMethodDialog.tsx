import { useState } from "react";
import { Layers, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateCostingMethod } from "@/features/inventory/valuation/useValuation";

interface CostingMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  currentMethod: "fifo" | "weighted_average";
}

export function CostingMethodDialog({
  open,
  onOpenChange,
  productId,
  productName,
  currentMethod,
}: CostingMethodDialogProps) {
  const [method, setMethod] = useState<"fifo" | "weighted_average">(currentMethod);
  const updateMutation = useUpdateCostingMethod();

  const handleSave = () => {
    if (method !== currentMethod) {
      updateMutation.mutate(
        { productId, costingMethod: method },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Costing Method</DialogTitle>
          <DialogDescription>
            Set the inventory costing method for "{productName}". This affects how
            COGS is calculated for sales.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Label className="text-base font-medium">Select Method</Label>
          <RadioGroup
            value={method}
            onValueChange={(v) => setMethod(v as "fifo" | "weighted_average")}
            className="space-y-3"
          >
            <Card
              className={`cursor-pointer transition-colors ${
                method === "fifo" ? "border-primary" : ""
              }`}
              onClick={() => setMethod("fifo")}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="fifo" id="fifo" />
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    FIFO (First-In, First-Out)
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Oldest received stock is assumed sold first. Each receipt creates a
                  cost layer. COGS reflects actual receipt costs in order. Best for
                  imports with varying landed costs.
                </CardDescription>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-colors ${
                method === "weighted_average" ? "border-primary" : ""
              }`}
              onClick={() => setMethod("weighted_average")}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="weighted_average" id="weighted_average" />
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Weighted Average
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Running average cost updated on each receipt. Simpler to track.
                  COGS uses current average cost. Best for stable pricing or high
                  volume items.
                </CardDescription>
              </CardContent>
            </Card>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
