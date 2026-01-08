import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Pencil, Trash2, Building2, Phone, Mail, User } from "lucide-react";
import { toast } from "sonner";

import {
  createSupplier,
  disableSupplier,
  listSuppliers,
  updateSupplier,
} from "@/features/procurement/suppliers/suppliers.api";
import type {
  CreateSupplierDto,
  Supplier as ApiSupplier,
  UpdateSupplierDto,
} from "@/features/procurement/suppliers/suppliers.types";

// ✅ keep your UI shape (snake_case) so UI code stays the same
type Supplier = {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
};

function mapApiToUi(s: ApiSupplier): Supplier {
  return {
    id: s.id,
    name: s.name,
    contact_person: s.contactName ?? null,
    email: s.email ?? null,
    phone: s.phone ?? null,
    address: s.address ?? null,
    is_active: !!s.isActive,
    created_at: s.createdAt ?? new Date().toISOString(),
  };
}

function toCreateDto(formData: {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
}): CreateSupplierDto {
  return {
    name: formData.name.trim(),
    contactName: formData.contact_person.trim() ? formData.contact_person.trim() : undefined,
    email: formData.email.trim() ? formData.email.trim() : undefined,
    phone: formData.phone.trim() ? formData.phone.trim() : undefined,
    address: formData.address.trim() ? formData.address.trim() : undefined,
  };
}

function toUpdateDto(formData: {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
}): UpdateSupplierDto {
  // backend accepts partial dto
  const dto: UpdateSupplierDto = {};

  dto.name = formData.name.trim();

  dto.contactName = formData.contact_person.trim()
    ? formData.contact_person.trim()
    : "";

  dto.email = formData.email.trim()
    ? formData.email.trim()
    : "";

  dto.phone = formData.phone.trim()
    ? formData.phone.trim()
    : "";

  dto.address = formData.address.trim()
    ? formData.address.trim()
    : "";

  return dto;
}

const Suppliers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ✅ backend suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteSupplierState, setDeleteSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      is_active: true,
    });
    setEditingSupplier(null);
    setIsDialogOpen(false);
  };

  const reloadSuppliers = async () => {
    try {
      setLoading(true);
      // includeDisabled=true so you can see inactive suppliers too
      const data = await listSuppliers({ includeDisabled: true });
      setSuppliers((data ?? []).map(mapApiToUi));
    } catch (e: any) {
      toast.error(e?.message || "Failed to load suppliers");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reloadSuppliers();
  }, []);

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      is_active: supplier.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSupplier) {
        // update basic fields
        await updateSupplier(editingSupplier.id, toUpdateDto(formData));

        // if user turned OFF active, disable
        if (editingSupplier.is_active && !formData.is_active) {
          await disableSupplier(editingSupplier.id);
        }

        // if user tries to turn ON active (backend doesn’t support enabling yet)
        if (!editingSupplier.is_active && formData.is_active) {
          toast.error("Activating a supplier is not supported yet (backend only supports disable).");
        }

        toast.success("Supplier updated successfully");
      } else {
        const created = await createSupplier(toCreateDto(formData));

        // if user created as inactive, disable immediately (backend creates as active)
        if (!formData.is_active) {
          await disableSupplier(created.id);
        }

        toast.success("Supplier created successfully");
      }

      await reloadSuppliers();
      resetForm();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save supplier");
    }
  };

  const handleToggleActive = async (supplier: Supplier) => {
    try {
      // backend only has disable, no enable
      if (!supplier.is_active) {
        toast.error("Activating a supplier is not supported yet (backend only supports disable).");
        return;
      }

      await disableSupplier(supplier.id);
      toast.success("Supplier deactivated");
      await reloadSuppliers();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update supplier status");
    }
  };

  const handleDelete = async () => {
    if (!deleteSupplierState) return;

    try {
      // treat delete as disable
      await disableSupplier(deleteSupplierState.id);
      toast.success("Supplier deleted successfully");
      setDeleteSupplier(null);
      await reloadSuppliers();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete supplier");
    }
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suppliers, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage your supplier contacts and information</p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) resetForm();
            else setIsDialogOpen(true);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
              <DialogDescription>
                {editingSupplier ? "Update supplier information" : "Enter the supplier details below"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active Supplier</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSupplier ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Directory</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No suppliers match your search" : "No suppliers found. Add your first supplier!"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{supplier.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {supplier.contact_person && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {supplier.contact_person}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {supplier.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {supplier.email}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {supplier.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {supplier.phone}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant={supplier.is_active ? "default" : "secondary"}>
                        {supplier.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(supplier)}>
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => handleToggleActive(supplier)}>
                          <Switch checked={supplier.is_active} />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => setDeleteSupplier(supplier)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteSupplierState} onOpenChange={() => setDeleteSupplier(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteSupplierState?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Suppliers;
