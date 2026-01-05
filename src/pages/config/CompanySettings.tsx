import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, RotateCcw, Building2, Upload, Image } from "lucide-react";

interface CompanyConfig {
  name: string;
  legalName: string;
  registrationNumber: string;
  taxId: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  logo: string | null;
}

export default function CompanySettings() {
  const [config, setConfig] = useState<CompanyConfig>({
    name: 'DevLabCo ERP',
    legalName: 'DevLabCo (Pvt) Ltd',
    registrationNumber: 'REG-2024-12345',
    taxId: 'TAX-987654321',
    email: 'info@devlabco.com',
    phone: '+94 11 234 5678',
    website: 'https://devlabco.com',
    address: {
      street: '123 Tech Park, Level 5',
      city: 'Colombo',
      state: 'Western Province',
      postalCode: '00100',
      country: 'Sri Lanka',
    },
    logo: null,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleAddressChange = (field: keyof typeof config.address, value: string) => {
    setConfig(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo file size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setConfig(prev => ({ ...prev, logo: null }));
  };

  const handleSave = () => {
    toast.success("Company settings saved successfully");
  };

  const handleReset = () => {
    toast.info("Changes reverted");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Company Settings</h1>
          <p className="text-muted-foreground">Manage your company information and branding</p>
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
        {/* Company Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Company Logo
            </CardTitle>
            <CardDescription>Upload your company logo for invoices and reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Company Logo"
                    className="max-h-32 max-w-full object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2"
                    onClick={handleRemoveLogo}
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-10 w-10" />
                  <p className="text-sm">No logo uploaded</p>
                </div>
              )}
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </span>
                  </Button>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB. Recommended: 200x60px</p>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Company name and registration details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Display name"
              />
            </div>
            <div className="space-y-2">
              <Label>Legal Name</Label>
              <Input
                value={config.legalName}
                onChange={(e) => setConfig(prev => ({ ...prev, legalName: e.target.value }))}
                placeholder="Registered legal name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input
                  value={config.registrationNumber}
                  onChange={(e) => setConfig(prev => ({ ...prev, registrationNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tax ID / VAT Number</Label>
                <Input
                  value={config.taxId}
                  onChange={(e) => setConfig(prev => ({ ...prev, taxId: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Company contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={config.email}
                onChange={(e) => setConfig(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={config.phone}
                onChange={(e) => setConfig(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                type="url"
                value={config.website}
                onChange={(e) => setConfig(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Company Address</CardTitle>
            <CardDescription>Physical address for invoices and documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Street Address</Label>
              <Textarea
                value={config.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={config.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>State / Province</Label>
                <Input
                  value={config.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Postal Code</Label>
                <Input
                  value={config.address.postalCode}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={config.address.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
