// ERP Configuration Types - Source of Truth for the entire application

export type ModuleId = 
  | 'dashboard'
  | 'pos'
  | 'sales'
  | 'inventory'
  | 'repairs'
  | 'customers'
  | 'suppliers'
  | 'reports'
  | 'config';

export type FeatureId =
  | 'credit_sales'
  | 'discounts'
  | 'returns'
  | 'split_payments'
  | 'serial_tracking'
  | 'batch_tracking'
  | 'stock_transfers'
  | 'stock_adjustments'
  | 'job_cards'
  | 'warranty_tracking'
  | 'multi_branch'
  | 'landed_costs'
  | 'vat_enabled'
  | 'approval_workflows'
  | 'offline_mode';

export interface ModuleConfig {
  id: ModuleId;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
  requiredRoles?: string[];
}

export interface FeatureToggle {
  id: FeatureId;
  name: string;
  description: string;
  enabled: boolean;
  moduleId: ModuleId;
}

export interface WorkflowStatus {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface WorkflowTransition {
  from: string;
  to: string;
  label: string;
  requiredRoles?: string[];
  requiresApproval?: boolean;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  entityType: 'job_card' | 'purchase_order' | 'stock_adjustment' | 'invoice' | 'grn';
  statuses: WorkflowStatus[];
  transitions: WorkflowTransition[];
}

export interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  entityType: string;
  condition: {
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number | string | boolean;
  };
  approverRoles: string[];
  enabled: boolean;
}
export interface DocumentNumbering {
  prefix: string;
  currentNumber: number;
  padLength: number;
  suffix?: string;
}

export interface DocumentNumberingConfig {
  invoice: DocumentNumbering;
  quotation: DocumentNumbering;
  purchaseOrder: DocumentNumbering;
  grn: DocumentNumbering;
  jobCard: DocumentNumbering;
  stockTransfer: DocumentNumbering;
  stockAdjustment: DocumentNumbering;
}

export interface LocalizationConfig {
  currency: string;
  currencySymbol: string;
  currencyPosition: 'before' | 'after';
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  timezone: string;
  language: string;
}

export interface TenantConfig {
  id: string;
  name: string;
  logo?: string;
  modules: ModuleConfig[];
  features: FeatureToggle[];
  workflows: WorkflowDefinition[];
  approvalRules: ApprovalRule[];
  documentNumbering: DocumentNumberingConfig;
  localization: LocalizationConfig;
  operationMode: 'full_erp' | 'pos_only' | 'inventory_only' | 'erp_no_service' | 'erp_no_imports';
}

export interface NavItem {
  id: string;
  title: string;
  icon: string;
  href?: string;
  moduleId: ModuleId;
  featureId?: FeatureId;
  requiredRoles?: string[];
  children?: NavItemChild[];
}

export interface NavItemChild {
  id: string;
  title: string;
  href: string;
  featureId?: FeatureId;
  requiredRoles?: string[];
}

export interface FieldSchema {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean' | 'textarea' | 'currency' | 'file';
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  visibilityCondition?: {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt';
    value: any;
  };
  featureId?: FeatureId;
  requiredRoles?: string[];
}

export interface PageSchema {
  id: string;
  title: string;
  moduleId: ModuleId;
  entityType: string;
  fields: FieldSchema[];
  sections?: {
    id: string;
    title: string;
    fields: string[];
    collapsible?: boolean;
    featureId?: FeatureId;
  }[];
}
