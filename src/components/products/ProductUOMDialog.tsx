import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductUOMDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

interface UOM {
  id: string;
  uom_name: string;
  conversion_factor: number;
  is_base_unit: boolean;
  is_purchase_unit: boolean;
  is_sales_unit: boolean;
  barcode: string | null;
}

interface NewUOM {
  uom_name: string;
  conversion_factor: number;
  is_base_unit: boolean;
  is_purchase_unit: boolean;
  is_sales_unit: boolean;
  barcode: string;
}

const emptyUOM: NewUOM = {
  uom_name: "",
  conversion_factor: 1,
  is_base_unit: false,
  is_purchase_unit: false,
  is_sales_unit: false,
  barcode: "",
};

export function ProductUOMDialog({
  open,
  onOpenChange,
  productId,
  productName,
}: ProductUOMDialogProps) {
  const queryClient = useQueryClient();
  const [newUOM, setNewUOM] = useState<NewUOM>(emptyUOM);
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: uoms = [], isLoading } = useQuery({
    queryKey: ["product-uom", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_uom")
        .select("*")
        .eq("product_id", productId)
        .order("conversion_factor", { ascending: true });
      if (error) throw error;
      return data as UOM[];
    },
    enabled: open && !!productId,
  });

  const addMutation = useMutation({
    mutationFn: async (uom: NewUOM) => {
      const { error } = await supabase.from("product_uom").insert({
        product_id: productId,
        uom_name: uom.uom_name,
        conversion_factor: uom.conversion_factor,
        is_base_unit: uom.is_base_unit,
        is_purchase_unit: uom.is_purchase_unit,
        is_sales_unit: uom.is_sales_unit,
        barcode: uom.barcode || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-uom", productId] });
      setNewUOM(emptyUOM);
      setShowAddForm(false);
      toast.success("UOM added successfully");
    },
    onError: () => {
      toast.error("Failed to add UOM");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (uomId: string) => {
      const { error } = await supabase.from("product_uom").delete().eq("id", uomId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-uom", productId] });
      toast.success("UOM deleted");
    },
    onError: () => {
      toast.error("Failed to delete UOM");
    },
  });

  const handleAddUOM = () => {
    if (!newUOM.uom_name.trim()) {
      toast.error("UOM name is required");
      return;
    }
    if (newUOM.conversion_factor <= 0) {
      toast.error("Conversion factor must be greater than 0");
      return;
    }
    addMutation.mutate(newUOM);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Unit of Measure - {productName}
          </DialogTitle>
          <DialogDescription>
            Configure different units of measure for purchasing and sales
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : uoms.length === 0 && !showAddForm ? (
            <div className="text-center py-8 text-muted-foreground">
              No UOM configured. Add your first unit of measure.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Name</TableHead>
                  <TableHead className="text-center">Factor</TableHead>
                  <TableHead className="text-center">Base</TableHead>
                  <TableHead className="text-center">Purchase</TableHead>
                  <TableHead className="text-center">Sales</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uoms.map((uom) => (
                  <TableRow key={uom.id}>
                    <TableCell className="font-medium">{uom.uom_name}</TableCell>
                    <TableCell className="text-center">{uom.conversion_factor}</TableCell>
                    <TableCell className="text-center">
                      {uom.is_base_unit && "✓"}
                    </TableCell>
                    <TableCell className="text-center">
                      {uom.is_purchase_unit && "✓"}
                    </TableCell>
                    <TableCell className="text-center">
                      {uom.is_sales_unit && "✓"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {uom.barcode || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(uom.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {showAddForm && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
              <h4 className="font-medium">Add New Unit</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit Name</Label>
                  <Input
                    placeholder="e.g., Box, Case, Pack"
                    value={newUOM.uom_name}
                    onChange={(e) => setNewUOM({ ...newUOM, uom_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Conversion Factor</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="e.g., 12 (1 box = 12 pieces)"
                    value={newUOM.conversion_factor}
                    onChange={(e) =>
                      setNewUOM({ ...newUOM, conversion_factor: parseFloat(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Barcode (Optional)</Label>
                  <Input
                    placeholder="Unit-specific barcode"
                    value={newUOM.barcode}
                    onChange={(e) => setNewUOM({ ...newUOM, barcode: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newUOM.is_base_unit}
                    onCheckedChange={(checked) => setNewUOM({ ...newUOM, is_base_unit: checked })}
                  />
                  <Label>Base Unit</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newUOM.is_purchase_unit}
                    onCheckedChange={(checked) => setNewUOM({ ...newUOM, is_purchase_unit: checked })}
                  />
                  <Label>Purchase Unit</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newUOM.is_sales_unit}
                    onCheckedChange={(checked) => setNewUOM({ ...newUOM, is_sales_unit: checked })}
                  />
                  <Label>Sales Unit</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUOM} disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Adding..." : "Add Unit"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
