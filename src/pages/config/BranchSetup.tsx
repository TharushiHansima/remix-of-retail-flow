import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Building2, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createBranch, deleteBranch, listBranches, updateBranch } from "@/features/branches/branches.api";
import type { Branch, CreateBranchInput } from "@/features/branches/branches.types";

const BranchSetup = () => {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deleteBranchId, setDeleteBranchId] = useState<string | null>(null);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const isBranchActive = (branch: Branch) => branch.isActive ?? true;

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await listBranches({ includeDisabled: true });
      setBranches(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading branches",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormCode(branch.code || "");
      setFormName(branch.name);
      setFormAddress(branch.address || "");
      setFormPhone(branch.phone || "");
      setFormIsActive(branch.isActive ?? true);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingBranch(null);
    setFormCode("");
    setFormName("");
    setFormAddress("");
    setFormPhone("");
    setFormIsActive(true);
  };

  const handleSave = async () => {
    if (!formCode.trim()) {
      toast({
        title: "Validation error",
        description: "Branch code is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formName.trim()) {
      toast({
        title: "Validation error",
        description: "Branch name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const branchData: CreateBranchInput = {
        code: formCode.trim(),
        name: formName.trim(),
        address: formAddress.trim() || null,
        phone: formPhone.trim() || null,
        isActive: formIsActive,
      };

      if (editingBranch) {
        await updateBranch(editingBranch.id, branchData);

        toast({
          title: "Branch updated",
          description: `${branchData.name} has been updated successfully.`,
        });
      } else {
        await createBranch(branchData);

        toast({
          title: "Branch created",
          description: `${branchData.name} has been created successfully.`,
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchBranches();
    } catch (error: any) {
      toast({
        title: "Error saving branch",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteBranchId) return;

    try {
      await deleteBranch(deleteBranchId);

      toast({
        title: "Branch deleted",
        description: "The branch has been removed.",
      });

      setDeleteBranchId(null);
      fetchBranches();
    } catch (error: any) {
      toast({
        title: "Error deleting branch",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleBranchStatus = async (branch: Branch) => {
    const wasActive = isBranchActive(branch);
    const nextIsActive = !wasActive;

    try {
      await updateBranch(branch.id, { isActive: nextIsActive });

      toast({
        title: wasActive ? "Branch deactivated" : "Branch activated",
        description: `${branch.name} is now ${wasActive ? "inactive" : "active"}.`,
      });

      fetchBranches();
    } catch (error: any) {
      toast({
        title: "Error updating branch",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Branch Setup</h1>
          <p className="text-muted-foreground">Manage your store branches and locations</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.filter((b) => isBranchActive(b)).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Branches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.filter((b) => !isBranchActive(b)).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Branches Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Branches</CardTitle>
          <CardDescription>View and manage all store branches</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading branches...</div>
          ) : branches.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No branches yet</h3>
              <p className="text-muted-foreground">Create your first branch to get started.</p>
              <Button className="mt-4" onClick={() => openDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Branch
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {branch.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {branch.address ? (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="max-w-[200px] truncate">{branch.address}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {branch.phone ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {branch.phone}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={isBranchActive(branch) ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleBranchStatus(branch)}
                      >
                        {isBranchActive(branch) ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(branch)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteBranchId(branch.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Branch Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Edit Branch" : "Add Branch"}</DialogTitle>
            <DialogDescription>
              {editingBranch ? "Update the branch details." : "Create a new store branch location."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="branchCode">Branch Code *</Label>
              <Input
                id="branchCode"
                placeholder="e.g., MAIN, BR-001"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name *</Label>
              <Input
                id="branchName"
                placeholder="e.g., Main Store, Downtown Branch"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchAddress">Address</Label>
              <Textarea
                id="branchAddress"
                placeholder="Full address of the branch"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchPhone">Phone Number</Label>
              <Input
                id="branchPhone"
                placeholder="e.g., +1 234 567 8900"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Enable this branch for operations</p>
              </div>
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingBranch ? "Save Changes" : "Add Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteBranchId} onOpenChange={(open) => !open && setDeleteBranchId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this branch? This action cannot be undone and may affect related records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BranchSetup;
