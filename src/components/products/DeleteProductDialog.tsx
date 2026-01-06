import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  categoryId?: string | null;
  brand: string;
  brandId?: string | null;
  type: "standard" | "serialized" | "batch";
  price: number;
  cost: number;
  stock: {
    main: number;
    downtown: number;
    warehouse: number;
  };
  status: "active" | "inactive" | "low_stock";
}

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onConfirm: (id: string) => Promise<boolean>;
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
}: DeleteProductDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!product) return;
    setSubmitting(true);
    try {
      const ok = await onConfirm(product.id);
      if (ok) onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{product.name}</strong> ({product.sku})?
            This action cannot be undone and will remove all associated stock records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={submitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {submitting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
