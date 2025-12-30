import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
  isActive: boolean;
}

interface PricingRule {
  id: string;
  name: string;
  type: 'markup' | 'margin' | 'fixed';
  value: number;
  appliesTo: 'all' | 'category' | 'brand';
  isActive: boolean;
}

const TaxPricing = () => {
  const { toast } = useToast();
  
  // Tax settings
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [defaultTaxRate, setDefaultTaxRate] = useState("vat");
  
  // Sample tax rates
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    { id: "vat", name: "VAT", rate: 15, isDefault: true, isActive: true },
    { id: "zero", name: "Zero Rated", rate: 0, isDefault: false, isActive: true },
    { id: "exempt", name: "Tax Exempt", rate: 0, isDefault: false, isActive: true },
  ]);
  
  // Pricing rules
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([
    { id: "1", name: "Standard Markup", type: "markup", value: 30, appliesTo: "all", isActive: true },
    { id: "2", name: "Electronics Margin", type: "margin", value: 25, appliesTo: "category", isActive: true },
  ]);
  
  // Rounding settings
  const [roundingEnabled, setRoundingEnabled] = useState(true);
  const [roundingMethod, setRoundingMethod] = useState("nearest");
  const [roundingPrecision, setRoundingPrecision] = useState("0.05");

  // Dialog states
  const [taxDialogOpen, setTaxDialogOpen] = useState(false);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingTaxId, setEditingTaxId] = useState<string | null>(null);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Delete confirmation states
  const [deleteTaxId, setDeleteTaxId] = useState<string | null>(null);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);

  // Tax form state
  const [newTaxName, setNewTaxName] = useState("");
  const [newTaxRate, setNewTaxRate] = useState("");
  const [newTaxIsDefault, setNewTaxIsDefault] = useState(false);
  const [newTaxIsActive, setNewTaxIsActive] = useState(true);

  // Pricing rule form state
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleType, setNewRuleType] = useState<'markup' | 'margin' | 'fixed'>("markup");
  const [newRuleValue, setNewRuleValue] = useState("");
  const [newRuleAppliesTo, setNewRuleAppliesTo] = useState<'all' | 'category' | 'brand'>("all");
  const [newRuleIsActive, setNewRuleIsActive] = useState(true);

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Tax and pricing settings have been updated successfully.",
    });
  };

  const handleReset = () => {
    toast({
      title: "Settings reset",
      description: "Tax and pricing settings have been reset to defaults.",
    });
  };

  const openTaxDialog = (tax?: TaxRate) => {
    if (tax) {
      setEditingTaxId(tax.id);
      setNewTaxName(tax.name);
      setNewTaxRate(tax.rate.toString());
      setNewTaxIsDefault(tax.isDefault);
      setNewTaxIsActive(tax.isActive);
    } else {
      resetTaxForm();
    }
    setTaxDialogOpen(true);
  };

  const openRuleDialog = (rule?: PricingRule) => {
    if (rule) {
      setEditingRuleId(rule.id);
      setNewRuleName(rule.name);
      setNewRuleType(rule.type);
      setNewRuleValue(rule.value.toString());
      setNewRuleAppliesTo(rule.appliesTo);
      setNewRuleIsActive(rule.isActive);
    } else {
      resetRuleForm();
    }
    setRuleDialogOpen(true);
  };

  const handleSaveTaxRate = () => {
    if (!newTaxName.trim() || newTaxRate === "") {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const taxData = {
      name: newTaxName.trim(),
      rate: parseFloat(newTaxRate),
      isDefault: newTaxIsDefault,
      isActive: newTaxIsActive,
    };

    if (editingTaxId) {
      // Update existing
      setTaxRates(prev => prev.map(t => {
        if (t.id === editingTaxId) {
          return { ...t, ...taxData };
        }
        // Remove default from others if this one is set as default
        if (newTaxIsDefault && t.id !== editingTaxId) {
          return { ...t, isDefault: false };
        }
        return t;
      }));
      toast({
        title: "Tax rate updated",
        description: `${taxData.name} has been updated successfully.`,
      });
    } else {
      // Create new
      const newTax: TaxRate = {
        id: crypto.randomUUID(),
        ...taxData,
      };

      if (newTaxIsDefault) {
        setTaxRates(prev => [...prev.map(t => ({ ...t, isDefault: false })), newTax]);
      } else {
        setTaxRates(prev => [...prev, newTax]);
      }
      toast({
        title: "Tax rate added",
        description: `${newTax.name} has been added successfully.`,
      });
    }

    setTaxDialogOpen(false);
    resetTaxForm();
  };

  const handleSavePricingRule = () => {
    if (!newRuleName.trim() || newRuleValue === "") {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const ruleData = {
      name: newRuleName.trim(),
      type: newRuleType,
      value: parseFloat(newRuleValue),
      appliesTo: newRuleAppliesTo,
      isActive: newRuleIsActive,
    };

    if (editingRuleId) {
      // Update existing
      setPricingRules(prev => prev.map(r => 
        r.id === editingRuleId ? { ...r, ...ruleData } : r
      ));
      toast({
        title: "Pricing rule updated",
        description: `${ruleData.name} has been updated successfully.`,
      });
    } else {
      // Create new
      const newRule: PricingRule = {
        id: crypto.randomUUID(),
        ...ruleData,
      };
      setPricingRules(prev => [...prev, newRule]);
      toast({
        title: "Pricing rule added",
        description: `${newRule.name} has been added successfully.`,
      });
    }

    setRuleDialogOpen(false);
    resetRuleForm();
  };

  const resetTaxForm = () => {
    setEditingTaxId(null);
    setNewTaxName("");
    setNewTaxRate("");
    setNewTaxIsDefault(false);
    setNewTaxIsActive(true);
  };

  const resetRuleForm = () => {
    setEditingRuleId(null);
    setNewRuleName("");
    setNewRuleType("markup");
    setNewRuleValue("");
    setNewRuleAppliesTo("all");
    setNewRuleIsActive(true);
  };

  const confirmDeleteTaxRate = () => {
    if (deleteTaxId) {
      setTaxRates(prev => prev.filter(t => t.id !== deleteTaxId));
      toast({
        title: "Tax rate deleted",
        description: "The tax rate has been removed.",
      });
      setDeleteTaxId(null);
    }
  };

  const confirmDeletePricingRule = () => {
    if (deleteRuleId) {
      setPricingRules(prev => prev.filter(r => r.id !== deleteRuleId));
      toast({
        title: "Pricing rule deleted",
        description: "The pricing rule has been removed.",
      });
      setDeleteRuleId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tax & Pricing</h1>
          <p className="text-muted-foreground">Configure tax rates and pricing rules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tax Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Settings</CardTitle>
            <CardDescription>Configure how taxes are applied to transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Tax</Label>
                <p className="text-sm text-muted-foreground">Apply tax to sales transactions</p>
              </div>
              <Switch checked={taxEnabled} onCheckedChange={setTaxEnabled} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tax Inclusive Pricing</Label>
                <p className="text-sm text-muted-foreground">Product prices include tax</p>
              </div>
              <Switch checked={taxInclusive} onCheckedChange={setTaxInclusive} />
            </div>
            
            <div className="space-y-2">
              <Label>Default Tax Rate</Label>
              <Select value={defaultTaxRate} onValueChange={setDefaultTaxRate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taxRates.filter(t => t.isActive).map((tax) => (
                    <SelectItem key={tax.id} value={tax.id}>
                      {tax.name} ({tax.rate}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Price Rounding */}
        <Card>
          <CardHeader>
            <CardTitle>Price Rounding</CardTitle>
            <CardDescription>Configure how prices are rounded</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Rounding</Label>
                <p className="text-sm text-muted-foreground">Round final prices automatically</p>
              </div>
              <Switch checked={roundingEnabled} onCheckedChange={setRoundingEnabled} />
            </div>
            
            <div className="space-y-2">
              <Label>Rounding Method</Label>
              <Select value={roundingMethod} onValueChange={setRoundingMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest">Round to Nearest</SelectItem>
                  <SelectItem value="up">Round Up</SelectItem>
                  <SelectItem value="down">Round Down</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Rounding Precision</Label>
              <Select value={roundingPrecision} onValueChange={setRoundingPrecision}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.01">0.01 (Cent)</SelectItem>
                  <SelectItem value="0.05">0.05</SelectItem>
                  <SelectItem value="0.10">0.10</SelectItem>
                  <SelectItem value="0.50">0.50</SelectItem>
                  <SelectItem value="1.00">1.00 (Whole)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Rates Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tax Rates</CardTitle>
            <CardDescription>Manage available tax rates</CardDescription>
          </div>
          <Button size="sm" onClick={() => openTaxDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tax Rate
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rate (%)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Default</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxRates.map((tax) => (
                <TableRow key={tax.id}>
                  <TableCell className="font-medium">{tax.name}</TableCell>
                  <TableCell>{tax.rate}%</TableCell>
                  <TableCell>
                    <Badge variant={tax.isActive ? "default" : "secondary"}>
                      {tax.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tax.isDefault && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openTaxDialog(tax)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTaxId(tax.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pricing Rules Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pricing Rules</CardTitle>
            <CardDescription>Configure markup and margin rules</CardDescription>
          </div>
          <Button size="sm" onClick={() => openRuleDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell className="capitalize">{rule.type}</TableCell>
                  <TableCell>{rule.type === 'fixed' ? `$${rule.value}` : `${rule.value}%`}</TableCell>
                  <TableCell className="capitalize">{rule.appliesTo}</TableCell>
                  <TableCell>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openRuleDialog(rule)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteRuleId(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Tax Rate Dialog */}
      <Dialog open={taxDialogOpen} onOpenChange={(open) => { setTaxDialogOpen(open); if (!open) resetTaxForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTaxId ? "Edit Tax Rate" : "Add Tax Rate"}</DialogTitle>
            <DialogDescription>
              {editingTaxId ? "Update the tax rate details." : "Create a new tax rate for your products and services."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taxName">Tax Name *</Label>
              <Input
                id="taxName"
                placeholder="e.g., VAT, GST, Sales Tax"
                value={newTaxName}
                onChange={(e) => setNewTaxName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Rate (%) *</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g., 15"
                value={newTaxRate}
                onChange={(e) => setNewTaxRate(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Set as Default</Label>
                <p className="text-sm text-muted-foreground">Use this rate for new products</p>
              </div>
              <Switch checked={newTaxIsDefault} onCheckedChange={setNewTaxIsDefault} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Enable this tax rate</p>
              </div>
              <Switch checked={newTaxIsActive} onCheckedChange={setNewTaxIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setTaxDialogOpen(false); resetTaxForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveTaxRate}>
              {editingTaxId ? "Save Changes" : "Add Tax Rate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Pricing Rule Dialog */}
      <Dialog open={ruleDialogOpen} onOpenChange={(open) => { setRuleDialogOpen(open); if (!open) resetRuleForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRuleId ? "Edit Pricing Rule" : "Add Pricing Rule"}</DialogTitle>
            <DialogDescription>
              {editingRuleId ? "Update the pricing rule details." : "Create a new pricing rule for markup or margin calculations."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ruleName">Rule Name *</Label>
              <Input
                id="ruleName"
                placeholder="e.g., Standard Markup, Premium Margin"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Rule Type *</Label>
              <Select value={newRuleType} onValueChange={(v) => setNewRuleType(v as 'markup' | 'margin' | 'fixed')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markup">Markup (% on cost)</SelectItem>
                  <SelectItem value="margin">Margin (% of selling price)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ruleValue">Value {newRuleType === 'fixed' ? '(Amount)' : '(%)'} *</Label>
              <Input
                id="ruleValue"
                type="number"
                min="0"
                step="0.01"
                placeholder={newRuleType === 'fixed' ? "e.g., 100" : "e.g., 30"}
                value={newRuleValue}
                onChange={(e) => setNewRuleValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Applies To *</Label>
              <Select value={newRuleAppliesTo} onValueChange={(v) => setNewRuleAppliesTo(v as 'all' | 'category' | 'brand')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="category">Specific Category</SelectItem>
                  <SelectItem value="brand">Specific Brand</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Enable this pricing rule</p>
              </div>
              <Switch checked={newRuleIsActive} onCheckedChange={setNewRuleIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRuleDialogOpen(false); resetRuleForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSavePricingRule}>
              {editingRuleId ? "Save Changes" : "Add Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tax Rate Confirmation */}
      <AlertDialog open={!!deleteTaxId} onOpenChange={(open) => !open && setDeleteTaxId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax Rate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tax rate? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTaxRate}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Pricing Rule Confirmation */}
      <AlertDialog open={!!deleteRuleId} onOpenChange={(open) => !open && setDeleteRuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pricing Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this pricing rule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePricingRule}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaxPricing;
