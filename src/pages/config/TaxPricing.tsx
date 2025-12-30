import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
          <Button size="sm">
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
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
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
          <Button size="sm">
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
                  <TableCell>{rule.value}%</TableCell>
                  <TableCell className="capitalize">{rule.appliesTo}</TableCell>
                  <TableCell>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxPricing;
