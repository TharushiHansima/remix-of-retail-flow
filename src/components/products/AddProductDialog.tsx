import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { CreateProductDto } from "@/features/inventory/products/products.types";

type Option = { id: string; name: string };

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Option[];
  brands: Option[];
  onSubmit: (dto: CreateProductDto) => Promise<boolean>;
}

function toOptionalNumber(value: string) {
  if (!value.trim()) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

const emptyForm = {
  sku: "",
  name: "",
  description: "",
  categoryId: "none",
  brandId: "none",
  unitPrice: "",
  wholesalePrice: "",
  costPrice: "",
  minStockLevel: "",
  maxStockLevel: "",
  reorderQuantity: "",
  isSerialized: false,
  isBatched: false,
  isActive: true,
};

export function AddProductDialog({
  open,
  onOpenChange,
  categories,
  brands,
  onSubmit,
}: AddProductDialogProps) {
  const [formData, setFormData] = useState({
    ...emptyForm,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const dto: CreateProductDto = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      isSerialized: formData.isSerialized,
      isBatched: formData.isBatched,
    };

    if (formData.categoryId !== "none") dto.categoryId = formData.categoryId;
    if (formData.brandId !== "none") dto.brandId = formData.brandId;

    const unitPrice = toOptionalNumber(formData.unitPrice);
    if (unitPrice !== undefined) {
      dto.unitPrice = unitPrice;
      dto.sellingPrice = unitPrice;
    }

    const costPrice = toOptionalNumber(formData.costPrice);
    if (costPrice !== undefined) dto.costPrice = costPrice;

    const wholesalePrice = toOptionalNumber(formData.wholesalePrice);
    if (wholesalePrice !== undefined) dto.wholesalePrice = wholesalePrice;

    const minStockLevel = toOptionalNumber(formData.minStockLevel);
    if (minStockLevel !== undefined) dto.minStockLevel = minStockLevel;

    const maxStockLevel = toOptionalNumber(formData.maxStockLevel);
    if (formData.maxStockLevel.trim() === "") {
  // leave undefined
    } else if (maxStockLevel !== undefined) {
    dto.maxStockLevel = maxStockLevel;
    }

    const reorderQty = toOptionalNumber(formData.reorderQuantity);
    if (reorderQty !== undefined) dto.reorderQty = reorderQty;

    dto.isActive = formData.isActive;

    try {
      const ok = await onSubmit(dto);
      if (ok) {
        setFormData({ ...emptyForm });
        onOpenChange(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., APL-IP15-256"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Select
                  value={formData.brandId}
                  onValueChange={(value) => setFormData({ ...formData, brandId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="none">No brand</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Pricing
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wholesalePrice">Wholesale Price</Label>
                <Input
                  id="wholesalePrice"
                  type="number"
                  step="0.01"
                  value={formData.wholesalePrice}
                  onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price *</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          {/* Stock Levels */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Stock Settings
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minStockLevel">Min Stock Level</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStockLevel">Max Stock Level</Label>
                <Input
                  id="maxStockLevel"
                  type="number"
                  value={formData.maxStockLevel}
                  onChange={(e) => setFormData({ ...formData, maxStockLevel: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderQuantity">Reorder Qty</Label>
                <Input
                  id="reorderQuantity"
                  type="number"
                  value={formData.reorderQuantity}
                  onChange={(e) => setFormData({ ...formData, reorderQuantity: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          {/* Product Type */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Product Type
            </h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="isSerialized"
                  checked={formData.isSerialized}
                  onCheckedChange={(checked) => setFormData({ ...formData, isSerialized: checked })}
                />
                <Label htmlFor="isSerialized">Serialized</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isBatched"
                  checked={formData.isBatched}
                  onCheckedChange={(checked) => setFormData({ ...formData, isBatched: checked })}
                />
                <Label htmlFor="isBatched">Batched</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
