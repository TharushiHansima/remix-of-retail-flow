import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConfig } from "@/contexts/ConfigContext";
import { toast } from "sonner";
import { Save, RotateCcw } from "lucide-react";

const currencyOptions = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
];

export default function SystemSettings() {
  const { config, updateConfig } = useConfig();
  const [localConfig, setLocalConfig] = useState(config);

  const handleLocalizationChange = (key: string, value: string | number) => {
    setLocalConfig(prev => ({
      ...prev,
      localization: { ...prev.localization, [key]: value }
    }));
  };

  const handleDocNumberChange = (docType: string, key: string, value: string | number) => {
    setLocalConfig(prev => ({
      ...prev,
      documentNumbering: {
        ...prev.documentNumbering,
        [docType]: { ...prev.documentNumbering[docType as keyof typeof prev.documentNumbering], [key]: value }
      }
    }));
  };

  const handleSave = () => {
    updateConfig(localConfig);
    toast.success("Settings saved successfully");
  };

  const handleReset = () => {
    setLocalConfig(config);
    toast.info("Changes reverted");
  };

  const operationModes = [
    { value: 'full_erp', label: 'Full ERP' },
    { value: 'pos_only', label: 'POS Only' },
    { value: 'inventory_only', label: 'Inventory Only' },
    { value: 'erp_no_service', label: 'ERP (No Service Module)' },
    { value: 'erp_no_imports', label: 'ERP (No Imports)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">System Settings</h1>
          <p className="text-muted-foreground">Configure your ERP system behavior</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Your company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={localConfig.name}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Operation Mode</Label>
              <Select
                value={localConfig.operationMode}
                onValueChange={(value) => setLocalConfig(prev => ({ ...prev, operationMode: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operationModes.map(mode => (
                    <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localization</CardTitle>
            <CardDescription>Currency, date, and number formats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={localConfig.localization.currency}
                  onValueChange={(value) => {
                    const selected = currencyOptions.find(c => c.code === value);
                    if (selected) {
                      handleLocalizationChange('currency', selected.code);
                      handleLocalizationChange('currencySymbol', selected.symbol);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name} ({currency.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency Symbol</Label>
                <Select
                  value={localConfig.localization.currencySymbol}
                  onValueChange={(value) => handleLocalizationChange('currencySymbol', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((currency) => (
                      <SelectItem key={currency.symbol + currency.code} value={currency.symbol}>
                        {currency.symbol} ({currency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Symbol Position</Label>
                <Select
                  value={localConfig.localization.currencyPosition}
                  onValueChange={(value) => handleLocalizationChange('currencyPosition', value)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Before ($100)</SelectItem>
                    <SelectItem value="after">After (100$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Decimal Places</Label>
                <Input
                  type="number"
                  min={0}
                  max={4}
                  value={localConfig.localization.decimalPlaces}
                  onChange={(e) => handleLocalizationChange('decimalPlaces', parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select
                  value={localConfig.localization.dateFormat}
                  onValueChange={(value) => handleLocalizationChange('dateFormat', value)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time Format</Label>
                <Select
                  value={localConfig.localization.timeFormat}
                  onValueChange={(value) => handleLocalizationChange('timeFormat', value)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12 Hour</SelectItem>
                    <SelectItem value="24h">24 Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Numbering</CardTitle>
          <CardDescription>Configure prefixes and sequences for documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(localConfig.documentNumbering).map(([docType, settings]) => (
              <div key={docType} className="p-4 rounded-lg border space-y-3">
                <h4 className="font-medium capitalize">{docType.replace(/([A-Z])/g, ' $1').trim()}</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Prefix</Label>
                    <Input
                      value={settings.prefix}
                      onChange={(e) => handleDocNumberChange(docType, 'prefix', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Pad Length</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={settings.padLength}
                      onChange={(e) => handleDocNumberChange(docType, 'padLength', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Preview: {settings.prefix}{String(settings.currentNumber).padStart(settings.padLength, '0')}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
