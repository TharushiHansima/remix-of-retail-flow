import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useConfig } from "@/contexts/ConfigContext";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Receipt, 
  Package, 
  Wrench, 
  Users, 
  Truck, 
  BarChart3, 
  Settings,
  Check,
  X
} from "lucide-react";
import type { ModuleId } from "@/config/types";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Wrench,
  Users,
  Truck,
  BarChart3,
  Settings,
};

export default function ModulesConfig() {
  const { config, toggleModule, isModuleEnabled } = useConfig();

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Package;
    return <Icon className="h-5 w-5" />;
  };

  const coreModules: ModuleId[] = ['dashboard', 'config'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Module Management</h1>
        <p className="text-muted-foreground">Enable or disable modules to customize your ERP experience</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {config.modules.map((module) => {
          const isCore = coreModules.includes(module.id);
          const enabled = isModuleEnabled(module.id);
          
          return (
            <Card key={module.id} className={!enabled ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {getIcon(module.icon)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{module.name}</CardTitle>
                      {isCore && <Badge variant="secondary" className="text-xs mt-1">Core</Badge>}
                    </div>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => toggleModule(module.id)}
                    disabled={isCore}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{module.description}</CardDescription>
                {module.requiredRoles && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {module.requiredRoles.map(role => (
                      <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Toggles</CardTitle>
          <CardDescription>Fine-tune features within each module</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {config.features.map((feature) => {
              const parentModule = config.modules.find(m => m.id === feature.moduleId);
              const moduleEnabled = isModuleEnabled(feature.moduleId);
              
              return (
                <div 
                  key={feature.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${!moduleEnabled ? "opacity-50 bg-muted/50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    {feature.enabled && moduleEnabled ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{feature.name}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{parentModule?.name}</Badge>
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={() => {
                        const updatedFeatures = config.features.map(f =>
                          f.id === feature.id ? { ...f, enabled: !f.enabled } : f
                        );
                        // Use updateConfig through context
                      }}
                      disabled={!moduleEnabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
