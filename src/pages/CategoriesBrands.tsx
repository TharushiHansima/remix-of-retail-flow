// CategoriesBrands.tsx
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Tag, Award, Power, ToggleLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

/* =========================
   API (added only)
   ========================= */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'erp.accessToken';

type ApiBrand = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
};

type ApiCategory = {
  id: string;
  name: string;
  parentId: string | null;
  brandId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
};

function getAuthHeader() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function extractErrorMessage(data: any): string {
  if (!data) return 'Request failed';
  if (typeof data === 'string') return data;
  if (Array.isArray(data.message)) return data.message.join(', ');
  return data.message || data.error || 'Request failed';
}

async function apiRequest<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.json !== undefined) headers.set('Content-Type', 'application/json');

  // JwtAuthGuard -> require token
  const auth = getAuthHeader();
  Object.entries(auth).forEach(([k, v]) => headers.set(k, v));

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) throw new Error(extractErrorMessage(data));
  return data as T;
}

// brands
async function listBrandsApi(includeDisabled = true) {
  return apiRequest<ApiBrand[]>(`/inventory/brands?includeDisabled=${includeDisabled}`, { method: 'GET' });
}
async function createBrandApi(name: string) {
  return apiRequest<ApiBrand>('/inventory/brands', { method: 'POST', json: { name } });
}
async function updateBrandApi(id: string, name: string) {
  return apiRequest<ApiBrand>(`/inventory/brands/${id}`, { method: 'PATCH', json: { name } });
}
async function disableBrandApi(id: string) {
  return apiRequest<ApiBrand>(`/inventory/brands/${id}/disable`, { method: 'PATCH' });
}
async function enableBrandApi(id: string) {
  return apiRequest<ApiBrand>(`/inventory/brands/${id}/enable`, { method: 'PATCH' });
}

// categories
async function listCategoriesApi(includeDisabled = true) {
  return apiRequest<ApiCategory[]>(`/inventory/categories?includeDisabled=${includeDisabled}`, { method: 'GET' });
}
async function createCategoryApi(input: { name: string; brandId?: string }) {
  return apiRequest<ApiCategory>('/inventory/categories', { method: 'POST', json: input });
}
async function updateCategoryApi(id: string, input: { name?: string; brandId?: string | null }) {
  return apiRequest<ApiCategory>(`/inventory/categories/${id}`, { method: 'PATCH', json: input });
}
async function disableCategoryApi(id: string) {
  return apiRequest<ApiCategory>(`/inventory/categories/${id}/disable`, { method: 'PATCH' });
}
async function enableCategoryApi(id: string) {
  return apiRequest<ApiCategory>(`/inventory/categories/${id}/enable`, { method: 'PATCH' });
}

/* =========================
   UI types (same shape as before)
   ========================= */
type Category = { id: string; name: string; brandId: string | null; isActive: boolean; productCount: number };
type Brand = { id: string; name: string; isActive: boolean; productCount: number };

type StatusFilterType = 'all' | 'active' | 'disabled';

export default function CategoriesBrands() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBrand, setNewCategoryBrand] = useState<string>('none');
  const [newBrandName, setNewBrandName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ type: 'category' | 'brand'; id: string; name: string } | null>(null);

  // Status filter
  const [categoryStatusFilter, setCategoryStatusFilter] = useState<StatusFilterType>('all');
  const [brandStatusFilter, setBrandStatusFilter] = useState<StatusFilterType>('all');

  // load categories + brands from backend
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [cats, brs] = await Promise.all([listCategoriesApi(true), listBrandsApi(true)]);

        setCategories(
          cats.map((c) => ({
            id: c.id,
            name: c.name,
            brandId: c.brandId ?? c.parentId ?? null,
            isActive: c.isActive ?? true,
            productCount: c.productCount ?? 0,
          })),
        );

        setBrands(
          brs.map((b) => ({
            id: b.id,
            name: b.name,
            isActive: b.isActive ?? true,
            productCount: b.productCount ?? 0,
          })),
        );
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load categories/brands');
      } finally {
        setLoading(false);
      }
    };

    void loadAll();
  }, []);

  const activeBrands = brands.filter(b => b.isActive);

  const openDeleteDialog = (type: 'category' | 'brand', id: string, name: string) => {
    setDeletingItem({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    if (deletingItem.type === 'category') {
      try {
        await disableCategoryApi(deletingItem.id);
        setCategories(categories.map(c => 
          c.id === deletingItem.id ? { ...c, isActive: false } : c
        ));
        toast.success('Category disabled successfully');
      } catch (e: any) {
        toast.error(e?.message || 'Failed to disable category');
      } finally {
        setDeleteDialogOpen(false);
        setDeletingItem(null);
      }
      return;
    }

    try {
      await disableBrandApi(deletingItem.id);
      setBrands(brands.map(b => 
        b.id === deletingItem.id ? { ...b, isActive: false } : b
      ));
      toast.success('Brand disabled successfully');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to disable brand');
    } finally {
      setDeleteDialogOpen(false);
      setDeletingItem(null);
    }
  };

  const handleToggleCategoryStatus = async (category: Category) => {
    try {
      if (category.isActive) {
        await disableCategoryApi(category.id);
        setCategories(categories.map(c => 
          c.id === category.id ? { ...c, isActive: false } : c
        ));
        toast.success('Category disabled');
      } else {
        await enableCategoryApi(category.id);
        setCategories(categories.map(c => 
          c.id === category.id ? { ...c, isActive: true } : c
        ));
        toast.success('Category enabled');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update category status');
    }
  };

  const handleToggleBrandStatus = async (brand: Brand) => {
    try {
      if (brand.isActive) {
        await disableBrandApi(brand.id);
        setBrands(brands.map(b => 
          b.id === brand.id ? { ...b, isActive: false } : b
        ));
        toast.success('Brand disabled');
      } else {
        await enableBrandApi(brand.id);
        setBrands(brands.map(b => 
          b.id === brand.id ? { ...b, isActive: true } : b
        ));
        toast.success('Brand enabled');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update brand status');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const created = await createCategoryApi({
        name: newCategoryName.trim(),
        ...(newCategoryBrand === 'none' ? {} : { brandId: newCategoryBrand }),
      });

      const newCategory: Category = {
        id: created.id,
        name: created.name,
        brandId: created.brandId ?? null,
        isActive: created.isActive ?? true,
        productCount: 0,
      };

      setCategories([newCategory, ...categories]);

      setNewCategoryName('');
      setNewCategoryBrand('none');
      setCategoryDialogOpen(false);
      toast.success('Category added successfully');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add category');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) return;

    try {
      const updated = await updateCategoryApi(editingCategory.id, {
        name: newCategoryName.trim(),
        brandId: newCategoryBrand === 'none' ? null : newCategoryBrand,
      });

      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: updated.name, brandId: updated.brandId ?? null }
            : c,
        ),
      );

      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryBrand('none');
      setCategoryDialogOpen(false);
      toast.success('Category updated successfully');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update category');
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;

    try {
      const created = await createBrandApi(newBrandName.trim());

      const newBrand: Brand = {
        id: created.id,
        name: created.name,
        isActive: created.isActive ?? true,
        productCount: 0,
      };

      setBrands([newBrand, ...brands]);
      setNewBrandName('');
      setBrandDialogOpen(false);
      toast.success('Brand added successfully');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add brand');
    }
  };

  const handleEditBrand = async () => {
    if (!editingBrand || !newBrandName.trim()) return;

    try {
      const updated = await updateBrandApi(editingBrand.id, newBrandName.trim());

      setBrands(brands.map(b =>
        b.id === editingBrand.id ? { ...b, name: updated.name } : b
      ));

      setEditingBrand(null);
      setNewBrandName('');
      setBrandDialogOpen(false);
      toast.success('Brand updated successfully');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update brand');
    }
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryBrand(category.brandId || 'none');
    setCategoryDialogOpen(true);
  };

  const openEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setNewBrandName(brand.name);
    setBrandDialogOpen(true);
  };

  const filteredCategories = categories.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = categoryStatusFilter === 'all' || 
      (categoryStatusFilter === 'active' && c.isActive) ||
      (categoryStatusFilter === 'disabled' && !c.isActive);
    return matchesSearch && matchesStatus;
  });

  const filteredBrands = brands.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = brandStatusFilter === 'all' || 
      (brandStatusFilter === 'active' && b.isActive) ||
      (brandStatusFilter === 'disabled' && !b.isActive);
    return matchesSearch && matchesStatus;
  });

  const getBrandName = (brandId: string | null) => {
    if (!brandId) return null;
    return brands.find(b => b.id === brandId)?.name || null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories & Brands</h1>
          <p className="text-muted-foreground">Manage product categories and brands</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Tag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Total Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{brands.length}</p>
                <p className="text-sm text-muted-foreground">Total Brands</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Management</CardTitle>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="categories">
            <TabsList>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="brands">Brands</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="space-y-4">
              <div className="flex justify-between items-center">
                <Tabs value={categoryStatusFilter} onValueChange={(v) => setCategoryStatusFilter(v as StatusFilterType)}>
                  <TabsList className="bg-transparent border">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="disabled">Disabled</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button onClick={() => {
                  setEditingCategory(null);
                  setNewCategoryName('');
                  setNewCategoryBrand('none');
                  setCategoryDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No categories found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id} className={!category.isActive ? 'opacity-50' : ''}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          {category.brandId ? (
                            <Badge variant="secondary">
                              {getBrandName(category.brandId)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{category.productCount}</TableCell>
                        <TableCell>
                          <Badge variant={category.isActive ? 'default' : 'secondary'}>
                            {category.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditCategory(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleToggleCategoryStatus(category)}
                            title={category.isActive ? 'Disable' : 'Enable'}
                          >
                            {category.isActive ? (
                              <Power className="h-4 w-4 text-destructive" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-primary" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="brands" className="space-y-4">
              <div className="flex justify-between items-center">
                <Tabs value={brandStatusFilter} onValueChange={(v) => setBrandStatusFilter(v as StatusFilterType)}>
                  <TabsList className="bg-transparent border">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="disabled">Disabled</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button onClick={() => {
                  setEditingBrand(null);
                  setNewBrandName('');
                  setBrandDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Brand
                </Button>
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredBrands.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No brands found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBrands.map((brand) => (
                      <TableRow key={brand.id} className={!brand.isActive ? 'opacity-50' : ''}>
                        <TableCell className="font-medium">{brand.name}</TableCell>
                        <TableCell>{brand.productCount}</TableCell>
                        <TableCell>
                          <Badge variant={brand.isActive ? 'default' : 'secondary'}>
                            {brand.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditBrand(brand)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleToggleBrandStatus(brand)}
                            title={brand.isActive ? 'Disable' : 'Enable'}
                          >
                            {brand.isActive ? (
                              <Power className="h-4 w-4 text-destructive" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-primary" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update category details.' : 'Create a new product category.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
            <div>
              <Label>Brand</Label>
              <Select value={newCategoryBrand} onValueChange={setNewCategoryBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {activeBrands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={editingCategory ? handleEditCategory : handleAddCategory}>
              {editingCategory ? 'Save Changes' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Brand Dialog */}
      <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
            <DialogDescription>
              {editingBrand ? 'Update brand details.' : 'Create a new brand.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Brand Name</Label>
              <Input
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Enter brand name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBrandDialogOpen(false)}>Cancel</Button>
            <Button onClick={editingBrand ? handleEditBrand : handleAddBrand}>
              {editingBrand ? 'Save Changes' : 'Add Brand'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable {deletingItem?.type === 'category' ? 'Category' : 'Brand'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disable "{deletingItem?.name}"?
              This will make it inactive but won't delete any associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleConfirmDelete()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Disable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
