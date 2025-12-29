import { ReactNode } from "react";
import { useConfig } from "@/contexts/ConfigContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import type { ModuleId, FeatureId } from "@/config/types";

interface ModuleGuardProps {
  moduleId: ModuleId;
  featureId?: FeatureId;
  requiredRoles?: string[];
  children: ReactNode;
}

export function ModuleGuard({ moduleId, featureId, requiredRoles, children }: ModuleGuardProps) {
  const { isModuleEnabled, isFeatureEnabled } = useConfig();
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  // Check module enabled
  if (!isModuleEnabled(moduleId)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Module Disabled</CardTitle>
            <CardDescription>
              This module has been disabled by your administrator.
              Contact support if you believe this is an error.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check feature enabled
  if (featureId && !isFeatureEnabled(featureId)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Feature Disabled</CardTitle>
            <CardDescription>
              This feature is not enabled in your current configuration.
              An administrator can enable it in System Settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role access
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAccess = requiredRoles.some(role => hasRole(role as 'admin' | 'manager' | 'cashier' | 'technician'));
    if (!hasAccess) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have the required permissions to access this page.
                Required roles: {requiredRoles.join(', ')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
}
