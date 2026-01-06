// CategoriesBrands.tsx
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Tag, Award } from 'lucide-react';
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
};

type ApiCategory = {
  id: string;
  name: string;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
async function listBrandsApi() {
  // controller supports includeDisabled but not needed for UI
  return apiRequest<ApiBrand[]>('/inventory/brands', { method: 'GET' });
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

// categories
async function listCategoriesApi() {
  return apiRequest<ApiCategory[]>('/inventory/categories', { method: 'GET' });
}
async function createCategoryApi(input: { name: string; parentId?: string }) {
  return apiRequest<ApiCategory>('/inventory/categories', { method: 'POST', json: input });
}
async function updateCategoryApi(id: string, input: { name?: string; parentId?: string | null }) {
  return apiRequest<ApiCategory>(`/inventory/categories/${id}`, { method: 'PATCH', json: input });
}
async function disableCategoryApi(id: string) {
  return apiRequest<ApiCategory>(`/inventory/categories/${id}/disable`, { method: 'PATCH' });
}

/* =========================
   UI types (same shape as before)
   ========================= */
type Category = { id: string; name: string; parentId: string | null; productCount: number };
type Brand = { id: string; name: string; productCount: number };

export default function CategoriesBrands() {
  // ✅ removed dummy data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState<string>('none');
  const [newBrandName, setNewBrandName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ type: 'category' | 'brand'; id: string; name: string } | null>(null);

  // ✅ load categories + brands from backend
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [cats, brs] = await Promise.all([listCategoriesApi(), listBrandsApi()]);

        setCategories(
          cats.map((c) => ({
            id: c.id,
            name: c.name,
            parentId: c.parentId ?? null,
            productCount: 0, // backend not sending productCount
          })),
        );

        setBrands(
          brs.map((b) => ({
            id: b.id,
            name: b.name,
            productCount: 0, // backend not sending productCount
          })),
        );
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load categories/brands');
      }
    };

    void loadAll();
  }, []);

  const parentCategories = categories.filter(c => !c.parentId);

  const getCategoryHierarchy = (category: Category) => {
    if (!category.parentId) return category.name;
    const parent = categories.find(c => c.id === category.parentId);
    return parent ? `${parent.name} → ${category.name}` : category.name;
  };

  const openDeleteDialog = (type: 'category' | 'brand', id: string, name: string) => {
    setDeletingItem({ type, id, name });
    setDeleteDialogOpen(true);
  };

  // ✅ Brand: "delete" -> DISABLE
  // ✅ Category: controller also provides DISABLE (no delete), so we disable + remove from UI
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    if (deletingItem.type === 'category') {
      try {
        await disableCategoryApi(deletingItem.id);

        // keep same UI behavior as before (remove category + direct subcategories from UI)
        setCategories(categories.filter(c => c.id !== deletingItem.id && c.parentId !== deletingItem.id));
        toast.success('Category deleted successfully');
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

      // keep same UI behavior as before (remove brand from UI)
      setBrands(brands.filter(b => b.id !== deletingItem.id));
      toast.success('Brand deleted successfully');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to disable brand');
    } finally {
      setDeleteDialogOpen(false);
      setDeletingItem(null);
    }
  };

  // ✅ Category create -> POST /inventory/categories
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const created = await createCategoryApi({
        name: newCategoryName.trim(),
        ...(newCategoryParent === 'none' ? {} : { parentId: newCategoryParent }),
      });

      const newCategory: Category = {
        id: created.id,
        name: created.name,
        parentId: created.parentId ?? null,
        productCount: 0,
      };

      setCategories([newCategory, ...categories]);

      setNewCategoryName('');
      setNewCategoryParent('none');
      setCategoryDialogOpen(false);
      toast.success('Category added successfully');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add category');
    }
  };

  // ✅ Category update -> PATCH /inventory/categories/:id
  const handleEditCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) return;

    try {
      const updated = await updateCategoryApi(editingCategory.id, {
        name: newCategoryName.trim(),
        parentId: newCategoryParent === 'none' ? null : newCategoryParent,
      });

      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: updated.name, parentId: updated.parentId ?? null }
            : c,
        ),
      );

      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryParent('none');
      setCategoryDialogOpen(false);
      toast.success('Category updated successfully');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update category');
    }
  };

  // ✅ Brand create -> POST /inventory/brands
  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;

    try {
      const created = await createBrandApi(newBrandName.trim());

      const newBrand: Brand = {
        id: created.id,
        name: created.name,
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

  // ✅ Brand update -> PATCH /inventory/brands/:id
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
    setNewCategoryParent(category.parentId || 'none');
    setCategoryDialogOpen(true);
  };

  const openEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setNewBrandName(brand.name);
    setBrandDialogOpen(true);
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <div className="flex justify-end">
                <Button onClick={() => {
                  setEditingCategory(null);
                  setNewCategoryName('');
                  setNewCategoryParent('none');
                  setCategoryDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        {category.parentId ? (
                          <Badge variant="secondary">
                            {categories.find(c => c.id === category.parentId)?.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Root</span>
                        )}
                      </TableCell>
                      <TableCell>{category.productCount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditCategory(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog('category', category.id, category.name)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="brands" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => {
                  setEditingBrand(null);
                  setNewBrandName('');
                  setBrandDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Brand
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>{brand.productCount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditBrand(brand)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog('brand', brand.id, brand.name)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
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
              <Label>Parent Category</Label>
              <Select value={newCategoryParent} onValueChange={setNewCategoryParent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Root Category)</SelectItem>
                  {parentCategories.filter(c => c.id !== editingCategory?.id).map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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
            <AlertDialogTitle>Delete {deletingItem?.type === 'category' ? 'Category' : 'Brand'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingItem?.name}"?
              {deletingItem?.type === 'category' && ' This will also delete all subcategories.'}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleConfirmDelete()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
