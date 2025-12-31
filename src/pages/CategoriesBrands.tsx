import { useState } from 'react';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Mock data
const mockCategories = [
  { id: '1', name: 'Mobile Phones', parentId: null, productCount: 45 },
  { id: '2', name: 'Smartphones', parentId: '1', productCount: 32 },
  { id: '3', name: 'Feature Phones', parentId: '1', productCount: 13 },
  { id: '4', name: 'Accessories', parentId: null, productCount: 120 },
  { id: '5', name: 'Cases & Covers', parentId: '4', productCount: 65 },
  { id: '6', name: 'Chargers', parentId: '4', productCount: 35 },
  { id: '7', name: 'Laptops', parentId: null, productCount: 28 },
  { id: '8', name: 'Tablets', parentId: null, productCount: 15 },
];

const mockBrands = [
  { id: '1', name: 'Apple', productCount: 42 },
  { id: '2', name: 'Samsung', productCount: 38 },
  { id: '3', name: 'Xiaomi', productCount: 25 },
  { id: '4', name: 'OnePlus', productCount: 18 },
  { id: '5', name: 'Google', productCount: 12 },
  { id: '6', name: 'Sony', productCount: 15 },
  { id: '7', name: 'LG', productCount: 10 },
  { id: '8', name: 'Huawei', productCount: 8 },
];

export default function CategoriesBrands() {
  const [categories, setCategories] = useState(mockCategories);
  const [brands, setBrands] = useState(mockBrands);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<typeof mockCategories[0] | null>(null);
  const [editingBrand, setEditingBrand] = useState<typeof mockBrands[0] | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState<string>('none');
  const [newBrandName, setNewBrandName] = useState('');

  const parentCategories = categories.filter(c => !c.parentId);

  const getCategoryHierarchy = (category: typeof mockCategories[0]) => {
    if (!category.parentId) return category.name;
    const parent = categories.find(c => c.id === category.parentId);
    return parent ? `${parent.name} → ${category.name}` : category.name;
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      parentId: newCategoryParent === 'none' ? null : newCategoryParent,
      productCount: 0,
    };
    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setNewCategoryParent('none');
    setCategoryDialogOpen(false);
    toast.success('Category added successfully');
  };

  const handleEditCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) return;
    setCategories(categories.map(c => 
      c.id === editingCategory.id 
        ? { ...c, name: newCategoryName, parentId: newCategoryParent === 'none' ? null : newCategoryParent }
        : c
    ));
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryParent('none');
    setCategoryDialogOpen(false);
    toast.success('Category updated successfully');
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id && c.parentId !== id));
    toast.success('Category deleted successfully');
  };

  const handleAddBrand = () => {
    if (!newBrandName.trim()) return;
    const newBrand = {
      id: Date.now().toString(),
      name: newBrandName,
      productCount: 0,
    };
    setBrands([...brands, newBrand]);
    setNewBrandName('');
    setBrandDialogOpen(false);
    toast.success('Brand added successfully');
  };

  const handleEditBrand = () => {
    if (!editingBrand || !newBrandName.trim()) return;
    setBrands(brands.map(b => 
      b.id === editingBrand.id ? { ...b, name: newBrandName } : b
    ));
    setEditingBrand(null);
    setNewBrandName('');
    setBrandDialogOpen(false);
    toast.success('Brand updated successfully');
  };

  const handleDeleteBrand = (id: string) => {
    setBrands(brands.filter(b => b.id !== id));
    toast.success('Brand deleted successfully');
  };

  const openEditCategory = (category: typeof mockCategories[0]) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryParent(category.parentId || 'none');
    setCategoryDialogOpen(true);
  };

  const openEditBrand = (brand: typeof mockBrands[0]) => {
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
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
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
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBrand(brand.id)}>
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
    </div>
  );
}
