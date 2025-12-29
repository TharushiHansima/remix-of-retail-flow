import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { 
  TenantConfig, 
  ModuleId, 
  FeatureId, 
  WorkflowDefinition, 
  ApprovalRule,
  NavItem,
  NavItemChild 
} from '@/config/types';
import { defaultTenantConfig, navigationConfig } from '@/config/defaultConfig';
import { useAuth } from './AuthContext';

interface ConfigContextType {
  config: TenantConfig;
  isLoading: boolean;
  
  // Module helpers
  isModuleEnabled: (moduleId: ModuleId) => boolean;
  toggleModule: (moduleId: ModuleId) => void;
  
  // Feature helpers
  isFeatureEnabled: (featureId: FeatureId) => boolean;
  toggleFeature: (featureId: FeatureId) => void;
  
  // Navigation helpers
  getFilteredNavigation: () => NavItem[];
  
  // Workflow helpers
  getWorkflow: (entityType: string) => WorkflowDefinition | undefined;
  getValidTransitions: (entityType: string, currentStatus: string, userRoles: string[]) => WorkflowDefinition['transitions'];
  
  // Approval helpers
  getApplicableRules: (entityType: string, data: Record<string, any>) => ApprovalRule[];
  checkApprovalRequired: (entityType: string, data: Record<string, any>) => { required: boolean; rules: ApprovalRule[] };
  
  // Localization helpers
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  
  // Update config
  updateConfig: (updates: Partial<TenantConfig>) => void;
  
  // Operation mode
  isPOSOnlyMode: () => boolean;
  isInventoryOnlyMode: () => boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<TenantConfig>(defaultTenantConfig);
  const [isLoading, setIsLoading] = useState(true);
  const { hasRole, roles } = useAuth();

  // Load config on mount (could be from API/database in future)
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // For now, use localStorage to persist config changes
        const savedConfig = localStorage.getItem('erp_config');
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          setConfig({ ...defaultTenantConfig, ...parsed });
        }
      } catch (error) {
        console.error('Error loading config:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, []);

  // Persist config changes
  const updateConfig = useCallback((updates: Partial<TenantConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      localStorage.setItem('erp_config', JSON.stringify(newConfig));
      return newConfig;
    });
  }, []);

  const isModuleEnabled = useCallback((moduleId: ModuleId): boolean => {
    const module = config.modules.find(m => m.id === moduleId);
    if (!module) return false;
    if (!module.enabled) return false;
    
    // Check operation mode restrictions
    switch (config.operationMode) {
      case 'pos_only':
        return ['dashboard', 'pos', 'config'].includes(moduleId);
      case 'inventory_only':
        return ['dashboard', 'inventory', 'suppliers', 'config'].includes(moduleId);
      case 'erp_no_service':
        return moduleId !== 'repairs';
      case 'erp_no_imports':
        return true; // Just disable the imports feature, not the whole module
      default:
        return module.enabled;
    }
  }, [config.modules, config.operationMode]);

  const toggleModule = useCallback((moduleId: ModuleId) => {
    const updatedModules = config.modules.map(m => 
      m.id === moduleId ? { ...m, enabled: !m.enabled } : m
    );
    updateConfig({ modules: updatedModules });
  }, [config.modules, updateConfig]);

  const isFeatureEnabled = useCallback((featureId: FeatureId): boolean => {
    const feature = config.features.find(f => f.id === featureId);
    if (!feature) return false;
    if (!feature.enabled) return false;
    
    // Check if parent module is enabled
    return isModuleEnabled(feature.moduleId);
  }, [config.features, isModuleEnabled]);

  const toggleFeature = useCallback((featureId: FeatureId) => {
    const updatedFeatures = config.features.map(f => 
      f.id === featureId ? { ...f, enabled: !f.enabled } : f
    );
    updateConfig({ features: updatedFeatures });
  }, [config.features, updateConfig]);

  const getFilteredNavigation = useCallback((): NavItem[] => {
    const userRolesList = roles.map(r => r.role);
    
    return navigationConfig
      .filter(item => {
        // Check module enabled
        if (!isModuleEnabled(item.moduleId)) return false;
        
        // Check role access
        if (item.requiredRoles && item.requiredRoles.length > 0) {
          if (!item.requiredRoles.some(role => userRolesList.includes(role as any))) {
            return false;
          }
        }
        
        return true;
      })
      .map(item => {
        // Filter children
        if (item.children) {
          const filteredChildren = item.children.filter(child => {
            // Check feature enabled
            if (child.featureId && !isFeatureEnabled(child.featureId)) return false;
            
            // Check role access
            if (child.requiredRoles && child.requiredRoles.length > 0) {
              if (!child.requiredRoles.some(role => userRolesList.includes(role as any))) {
                return false;
              }
            }
            
            return true;
          });
          
          return { ...item, children: filteredChildren };
        }
        
        return item;
      })
      .filter(item => !item.children || item.children.length > 0);
  }, [roles, isModuleEnabled, isFeatureEnabled]);

  const getWorkflow = useCallback((entityType: string): WorkflowDefinition | undefined => {
    return config.workflows.find(w => w.entityType === entityType);
  }, [config.workflows]);

  const getValidTransitions = useCallback((
    entityType: string, 
    currentStatus: string, 
    userRoles: string[]
  ): WorkflowDefinition['transitions'] => {
    const workflow = getWorkflow(entityType);
    if (!workflow) return [];
    
    return workflow.transitions.filter(t => {
      if (t.from !== currentStatus) return false;
      if (t.requiredRoles && t.requiredRoles.length > 0) {
        return t.requiredRoles.some(role => userRoles.includes(role));
      }
      return true;
    });
  }, [getWorkflow]);

  const getApplicableRules = useCallback((
    entityType: string, 
    data: Record<string, any>
  ): ApprovalRule[] => {
    return config.approvalRules.filter(rule => {
      if (!rule.enabled) return false;
      if (rule.entityType !== entityType) return false;
      
      const fieldValue = data[rule.condition.field];
      const conditionValue = rule.condition.value;
      
      switch (rule.condition.operator) {
        case 'gt': return fieldValue > conditionValue;
        case 'lt': return fieldValue < conditionValue;
        case 'eq': return fieldValue === conditionValue;
        case 'gte': return fieldValue >= conditionValue;
        case 'lte': return fieldValue <= conditionValue;
        default: return false;
      }
    });
  }, [config.approvalRules]);

  const checkApprovalRequired = useCallback((
    entityType: string, 
    data: Record<string, any>
  ): { required: boolean; rules: ApprovalRule[] } => {
    const applicableRules = getApplicableRules(entityType, data);
    return {
      required: applicableRules.length > 0,
      rules: applicableRules,
    };
  }, [getApplicableRules]);

  const formatCurrency = useCallback((amount: number): string => {
    const { currencySymbol, currencyPosition, decimalPlaces, thousandsSeparator, decimalSeparator } = config.localization;
    
    const formatted = amount
      .toFixed(decimalPlaces)
      .replace('.', decimalSeparator)
      .replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    
    return currencyPosition === 'before' 
      ? `${currencySymbol}${formatted}` 
      : `${formatted}${currencySymbol}`;
  }, [config.localization]);

  const formatDate = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const { dateFormat } = config.localization;
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return dateFormat
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year.toString());
  }, [config.localization]);

  const isPOSOnlyMode = useCallback(() => config.operationMode === 'pos_only', [config.operationMode]);
  const isInventoryOnlyMode = useCallback(() => config.operationMode === 'inventory_only', [config.operationMode]);

  return (
    <ConfigContext.Provider
      value={{
        config,
        isLoading,
        isModuleEnabled,
        toggleModule,
        isFeatureEnabled,
        toggleFeature,
        getFilteredNavigation,
        getWorkflow,
        getValidTransitions,
        getApplicableRules,
        checkApprovalRequired,
        formatCurrency,
        formatDate,
        updateConfig,
        isPOSOnlyMode,
        isInventoryOnlyMode,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
