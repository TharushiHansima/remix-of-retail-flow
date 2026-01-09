import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MapPin,
  Warehouse,
  Trash2,
  Pencil,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StockLocation {
  id: string;
  branch_id: string;
  zone: string | null;
  aisle: string | null;
  rack: string | null;
  shelf: string | null;
  bin: string | null;
  location_code: string;
  description: string | null;
  is_active: boolean;
  branches?: { name: string };
}

interface LocationForm {
  branch_id: string;
  zone: string;
  aisle: string;
  rack: string;
  shelf: string;
  bin: string;
  location_code: string;
  description: string;
}

const emptyForm: LocationForm = {
  branch_id: "",
  zone: "",
  aisle: "",
  rack: "",
  shelf: "",
  bin: "",
  location_code: "",
  description: "",
};

const StockLocations = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StockLocation | null>(null);
  const [form, setForm] = useState<LocationForm>(emptyForm);

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

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["stock-locations", selectedBranch],
    queryFn: async () => {
      let query = supabase
        .from("stock_locations")
        .select("*, branches(name)")
        .order("location_code");

      if (selectedBranch) {
        query = query.eq("branch_id", selectedBranch);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StockLocation[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: LocationForm) => {
      const payload = {
        branch_id: data.branch_id,
        zone: data.zone || null,
        aisle: data.aisle || null,
        rack: data.rack || null,
        shelf: data.shelf || null,
        bin: data.bin || null,
        location_code: data.location_code,
        description: data.description || null,
      };

      if (editingLocation) {
        const { error } = await supabase
          .from("stock_locations")
          .update(payload)
          .eq("id", editingLocation.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("stock_locations").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-locations"] });
      setDialogOpen(false);
      setEditingLocation(null);
      setForm(emptyForm);
      toast.success(editingLocation ? "Location updated" : "Location created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save location");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("stock_locations")
        .update({ is_active: isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-locations"] });
      toast.success("Location status updated");
    },
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stock_locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-locations"] });
      toast.success("Location deleted");
      setDeleteConfirmId(null);
    },
  });

  const generateLocationCode = () => {
    const parts = [form.zone, form.aisle, form.rack, form.shelf, form.bin]
      .filter(Boolean)
      .join("-");
    setForm({ ...form, location_code: parts || "" });
  };

  const handleEdit = (location: StockLocation) => {
    setEditingLocation(location);
    setForm({
      branch_id: location.branch_id,
      zone: location.zone || "",
      aisle: location.aisle || "",
      rack: location.rack || "",
      shelf: location.shelf || "",
      bin: location.bin || "",
      location_code: location.location_code,
      description: location.description || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.branch_id) {
      toast.error("Branch is required");
      return;
    }
    if (!form.location_code.trim()) {
      toast.error("Location code is required");
      return;
    }
    saveMutation.mutate(form);
  };

  const filteredLocations = locations.filter(
    (loc) =>
      loc.location_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.zone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Locations</h1>
          <p className="text-muted-foreground">
            Manage bin, rack, and shelf locations for inventory
          </p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setEditingLocation(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zones</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(locations.map((l) => l.zone).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations.filter((l) => l.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Locations</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search locations..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No locations found. Add your first location.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location Code</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Aisle</TableHead>
                  <TableHead>Rack</TableHead>
                  <TableHead>Shelf</TableHead>
                  <TableHead>Bin</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium font-mono">
                      {location.location_code}
                    </TableCell>
                    <TableCell>{location.branches?.name}</TableCell>
                    <TableCell>{location.zone || "-"}</TableCell>
                    <TableCell>{location.aisle || "-"}</TableCell>
                    <TableCell>{location.rack || "-"}</TableCell>
                    <TableCell>{location.shelf || "-"}</TableCell>
                    <TableCell>{location.bin || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {location.description || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={location.is_active ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleStatusMutation.mutate({ 
                          id: location.id, 
                          isActive: !location.is_active 
                        })}
                      >
                        {location.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(location)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmId(location.id)}
                        >
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? "Edit Location" : "Add Stock Location"}
            </DialogTitle>
            <DialogDescription>
              Define warehouse location using zone, aisle, rack, shelf, and bin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select
                value={form.branch_id}
                onValueChange={(v) => setForm({ ...form, branch_id: v })}
              >
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

            <div className="grid grid-cols-5 gap-2">
              <div className="space-y-2">
                <Label>Zone</Label>
                <Input
                  placeholder="A"
                  value={form.zone}
                  onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  onBlur={generateLocationCode}
                />
              </div>
              <div className="space-y-2">
                <Label>Aisle</Label>
                <Input
                  placeholder="01"
                  value={form.aisle}
                  onChange={(e) => setForm({ ...form, aisle: e.target.value })}
                  onBlur={generateLocationCode}
                />
              </div>
              <div className="space-y-2">
                <Label>Rack</Label>
                <Input
                  placeholder="R1"
                  value={form.rack}
                  onChange={(e) => setForm({ ...form, rack: e.target.value })}
                  onBlur={generateLocationCode}
                />
              </div>
              <div className="space-y-2">
                <Label>Shelf</Label>
                <Input
                  placeholder="S1"
                  value={form.shelf}
                  onChange={(e) => setForm({ ...form, shelf: e.target.value })}
                  onBlur={generateLocationCode}
                />
              </div>
              <div className="space-y-2">
                <Label>Bin</Label>
                <Input
                  placeholder="B1"
                  value={form.bin}
                  onChange={(e) => setForm({ ...form, bin: e.target.value })}
                  onBlur={generateLocationCode}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location Code</Label>
              <Input
                placeholder="A-01-R1-S1-B1"
                value={form.location_code}
                onChange={(e) => setForm({ ...form, location_code: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from zone/aisle/rack/shelf/bin or enter manually
              </p>
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                placeholder="e.g., Electronics storage area"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editingLocation ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockLocations;
