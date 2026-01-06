import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";

const openDrawerSchema = z.object({
  branchId: z.string().uuid({ message: "Please select a branch" }),
  openingFloat: z.number().min(0, { message: "Opening float must be 0 or greater" }).max(1000000, { message: "Opening float is too large" }),
});

interface OpenDrawerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OpenDrawerDialog({ open, onOpenChange }: OpenDrawerDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [branchId, setBranchId] = useState<string>("");
  const [openingFloat, setOpeningFloat] = useState<string>("0");

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const openDrawerMutation = useMutation({
    mutationFn: async () => {
      const floatValue = parseFloat(openingFloat) || 0;
      
      const validation = openDrawerSchema.safeParse({
        branchId,
        openingFloat: floatValue,
      });
      
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const { data, error } = await supabase
        .from("cash_drawers")
        .insert({
          branch_id: branchId,
          opened_by: user?.id,
          opening_float: floatValue,
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-drawer"] });
      toast.success("Cash drawer opened successfully");
      onOpenChange(false);
      setBranchId("");
      setOpeningFloat("0");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to open cash drawer");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open Cash Drawer</DialogTitle>
          <DialogDescription>
            Start a new cash drawer session with an opening float amount.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="openingFloat">Opening Float ($)</Label>
            <Input
              id="openingFloat"
              type="number"
              min="0"
              step="0.01"
              value={openingFloat}
              onChange={(e) => setOpeningFloat(e.target.value)}
              placeholder="0.00"
            />
            <p className="text-sm text-muted-foreground">
              Enter the amount of cash in the drawer at the start of the shift.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => openDrawerMutation.mutate()}
            disabled={openDrawerMutation.isPending || !branchId}
          >
            {openDrawerMutation.isPending ? "Opening..." : "Open Drawer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
