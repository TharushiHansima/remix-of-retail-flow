import { useState } from "react";
import { Calculator, Package, DollarSign, Scale } from "lucide-react";
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
import { useAllocateLandedCosts } from "@/features/inventory/valuation/useValuation";
import type { AllocationMethod } from "@/features/inventory/valuation/valuation.types";

interface LandedCostAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grnId: string;
  grnNumber: string;
  totalLandedCost: number;
  itemCount: number;
}

export function LandedCostAllocationDialog({
  open,
  onOpenChange,
  grnId,
  grnNumber,
  totalLandedCost,
  itemCount,
}: LandedCostAllocationDialogProps) {
  const [method, setMethod] = useState<AllocationMethod>("quantity");
  const allocateMutation = useAllocateLandedCosts();

  const handleAllocate = () => {
    allocateMutation.mutate(
      { grnId, allocationMethod: method },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Allocate Landed Costs
          </DialogTitle>
          <DialogDescription>
            Allocate {formatCurrency(totalLandedCost)} in landed costs across{" "}
            {itemCount} items in GRN #{grnNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Label className="text-base font-medium">Allocation Method</Label>
          <RadioGroup
            value={method}
            onValueChange={(v) => setMethod(v as AllocationMethod)}
            className="space-y-3"
          >
            <Card
              className={`cursor-pointer transition-colors ${
                method === "quantity" ? "border-primary" : ""
              }`}
              onClick={() => setMethod("quantity")}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="quantity" id="quantity" />
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    By Quantity
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Each unit gets an equal share of landed costs. Best for similar
                  items with similar size/value.
                </CardDescription>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-colors ${
                method === "value" ? "border-primary" : ""
              }`}
              onClick={() => setMethod("value")}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="value" id="value" />
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    By Value
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Higher-value items get more landed cost allocation. Best for mixed
                  items where expensive items should carry more costs.
                </CardDescription>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-colors ${
                method === "weight" ? "border-primary" : ""
              }`}
              onClick={() => setMethod("weight")}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="weight" id="weight" />
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    By Weight
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Heavier items get more landed cost allocation. Best for
                  shipping-dominated costs (freight by weight/volume). Requires
                  product weights to be set.
                </CardDescription>
              </CardContent>
            </Card>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAllocate} disabled={allocateMutation.isPending}>
            {allocateMutation.isPending ? "Allocating..." : "Allocate Costs"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
