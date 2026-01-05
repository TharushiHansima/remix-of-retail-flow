import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, RotateCcw, Shield, Lock, Key, Clock, AlertTriangle, UserCheck } from "lucide-react";

interface SecurityConfig {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecial: boolean;
  passwordExpiryDays: number;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  requireMFA: boolean;
  mfaMethod: 'email' | 'sms' | 'authenticator';
  requireApprovalForNewUsers: boolean;
  allowRememberMe: boolean;
  forceLogoutOnPasswordChange: boolean;
  singleSessionOnly: boolean;
}

export default function SecuritySettings() {
  const [config, setConfig] = useState<SecurityConfig>({
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecial: false,
    passwordExpiryDays: 90,
    sessionTimeoutMinutes: 30,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    requireMFA: false,
    mfaMethod: 'email',
    requireApprovalForNewUsers: true,
    allowRememberMe: true,
    forceLogoutOnPasswordChange: true,
    singleSessionOnly: false,
  });

  const handleSave = () => {
    toast.success("Security settings saved successfully");
  };

  const handleReset = () => {
    setConfig({
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecial: false,
      passwordExpiryDays: 90,
      sessionTimeoutMinutes: 30,
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 15,
      requireMFA: false,
      mfaMethod: 'email',
      requireApprovalForNewUsers: true,
      allowRememberMe: true,
      forceLogoutOnPasswordChange: true,
      singleSessionOnly: false,
    });
    toast.info("Settings reset to defaults");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Security & Authentication</h1>
          <p className="text-muted-foreground">Configure authentication and session security settings</p>
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
        {/* Password Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password Policy
            </CardTitle>
            <CardDescription>Define password requirements for user accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Minimum Password Length</Label>
              <Input
                type="number"
                min={6}
                max={32}
                value={config.passwordMinLength}
                onChange={(e) => setConfig(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Require Uppercase Letters</Label>
              <Switch
                checked={config.passwordRequireUppercase}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, passwordRequireUppercase: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Require Lowercase Letters</Label>
              <Switch
                checked={config.passwordRequireLowercase}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, passwordRequireLowercase: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Require Numbers</Label>
              <Switch
                checked={config.passwordRequireNumbers}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, passwordRequireNumbers: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Require Special Characters</Label>
              <Switch
                checked={config.passwordRequireSpecial}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, passwordRequireSpecial: checked }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Password Expiry (Days)</Label>
              <Input
                type="number"
                min={0}
                max={365}
                value={config.passwordExpiryDays}
                onChange={(e) => setConfig(prev => ({ ...prev, passwordExpiryDays: parseInt(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground">Set to 0 for no expiry</p>
            </div>
          </CardContent>
        </Card>

        {/* Session Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session Management
            </CardTitle>
            <CardDescription>Control user session behavior and timeouts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Session Timeout (Minutes)</Label>
              <Input
                type="number"
                min={5}
                max={480}
                value={config.sessionTimeoutMinutes}
                onChange={(e) => setConfig(prev => ({ ...prev, sessionTimeoutMinutes: parseInt(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground">Auto logout after inactivity</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow "Remember Me"</Label>
                <p className="text-xs text-muted-foreground">Extended sessions on trusted devices</p>
              </div>
              <Switch
                checked={config.allowRememberMe}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, allowRememberMe: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Single Session Only</Label>
                <p className="text-xs text-muted-foreground">Logout from other devices on new login</p>
              </div>
              <Switch
                checked={config.singleSessionOnly}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, singleSessionOnly: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Force Logout on Password Change</Label>
                <p className="text-xs text-muted-foreground">Invalidate all sessions when password changes</p>
              </div>
              <Switch
                checked={config.forceLogoutOnPasswordChange}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, forceLogoutOnPasswordChange: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Login Protection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Login Protection
            </CardTitle>
            <CardDescription>Protect against brute force attacks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Max Login Attempts</Label>
              <Input
                type="number"
                min={3}
                max={10}
                value={config.maxLoginAttempts}
                onChange={(e) => setConfig(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Lockout Duration (Minutes)</Label>
              <Input
                type="number"
                min={5}
                max={1440}
                value={config.lockoutDurationMinutes}
                onChange={(e) => setConfig(prev => ({ ...prev, lockoutDurationMinutes: parseInt(e.target.value) }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Multi-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Multi-Factor Authentication
            </CardTitle>
            <CardDescription>Additional security layer for user accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Require MFA</Label>
                <p className="text-xs text-muted-foreground">Enforce MFA for all users</p>
              </div>
              <Switch
                checked={config.requireMFA}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, requireMFA: checked }))}
              />
            </div>
            <div className="space-y-2">
              <Label>MFA Method</Label>
              <Select
                value={config.mfaMethod}
                onValueChange={(value: 'email' | 'sms' | 'authenticator') => setConfig(prev => ({ ...prev, mfaMethod: value }))}
                disabled={!config.requireMFA}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email OTP</SelectItem>
                  <SelectItem value="sms">SMS OTP</SelectItem>
                  <SelectItem value="authenticator">Authenticator App</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* User Registration */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              User Registration
            </CardTitle>
            <CardDescription>Control how new users are registered and approved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between max-w-md">
              <div>
                <Label>Require Admin Approval for New Users</Label>
                <p className="text-xs text-muted-foreground">New accounts must be approved before login</p>
              </div>
              <Switch
                checked={config.requireApprovalForNewUsers}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, requireApprovalForNewUsers: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
