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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

type Option = { id: string; name: string };

interface BulkCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  categories: Option[];
  onConfirm: (categoryId: string | null) => Promise<void>;
}

export function BulkCategoryDialog({
  open,
  onOpenChange,
  selectedCount,
  categories,
  onConfirm,
}: BulkCategoryDialogProps) {
  const [categoryId, setCategoryId] = useState<string>("none");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(categoryId === "none" ? null : categoryId);
      onOpenChange(false);
      setCategoryId("none");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Update Product Category
          </DialogTitle>
          <DialogDescription>
            Change the category for{" "}
            <Badge variant="secondary" className="mx-1">
              {selectedCount} product{selectedCount !== 1 ? "s" : ""}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Select new category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="none">
                  <span className="text-muted-foreground">No category (remove)</span>
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              All selected products will be moved to this category
            </p>
          </div>
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
