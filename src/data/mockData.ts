// Mock data for the application - replaces Supabase database

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category_id: string | null;
  brand_id: string | null;
  unit_price: number;
  cost_price: number;
  wholesale_price: number;
  is_serialized: boolean;
  is_batched: boolean;
  is_active: boolean;
  min_stock_level: number | null;
  max_stock_level: number | null;
  reorder_quantity: number | null;
  lead_time_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  credit_limit: number | null;
  credit_balance: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  status: string;
  customer_id: string | null;
  branch_id: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  customer?: Customer | null;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_percent: number | null;
  tax_percent: number | null;
  total: number;
  product?: Product | null;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  reference: string | null;
  created_at: string;
  created_by: string | null;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  branch_id: string;
  status: string;
  total_amount: number;
  expected_delivery: string | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  approved_at: string | null;
  approved_by: string | null;
  supplier?: Supplier | null;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  received_quantity: number;
  product?: Product | null;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  approval_status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "manager" | "cashier" | "technician";
}

// Mock Data

export const mockBranches: Branch[] = [
  { id: "1", name: "Main Store", address: "123 Main St, New York, NY", phone: "+1 234 567 8900", is_active: true, created_at: "2024-01-01" },
  { id: "2", name: "Downtown Branch", address: "456 Downtown Ave, New York, NY", phone: "+1 234 567 8901", is_active: true, created_at: "2024-01-01" },
  { id: "3", name: "Warehouse", address: "789 Industrial Blvd, New York, NY", phone: "+1 234 567 8902", is_active: true, created_at: "2024-01-01" },
];

export const mockCategories: Category[] = [
  { id: "1", name: "Smartphones", parent_id: null, created_at: "2024-01-01" },
  { id: "2", name: "Laptops", parent_id: null, created_at: "2024-01-01" },
  { id: "3", name: "Tablets", parent_id: null, created_at: "2024-01-01" },
  { id: "4", name: "Accessories", parent_id: null, created_at: "2024-01-01" },
  { id: "5", name: "Audio", parent_id: null, created_at: "2024-01-01" },
];

export const mockBrands: Brand[] = [
  { id: "1", name: "Apple", created_at: "2024-01-01" },
  { id: "2", name: "Samsung", created_at: "2024-01-01" },
  { id: "3", name: "Generic", created_at: "2024-01-01" },
  { id: "4", name: "Sony", created_at: "2024-01-01" },
  { id: "5", name: "LG", created_at: "2024-01-01" },
];

export const mockProducts: Product[] = [
  {
    id: "1",
    sku: "APL-IP15PM-256",
    name: "iPhone 15 Pro Max 256GB",
    description: "Latest Apple flagship smartphone",
    category_id: "1",
    brand_id: "1",
    unit_price: 1199,
    cost_price: 950,
    wholesale_price: 1050,
    is_serialized: true,
    is_batched: false,
    is_active: true,
    min_stock_level: 5,
    max_stock_level: 50,
    reorder_quantity: 10,
    lead_time_days: 7,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "2",
    sku: "SAM-S24U-256",
    name: "Samsung Galaxy S24 Ultra",
    description: "Samsung flagship smartphone",
    category_id: "1",
    brand_id: "2",
    unit_price: 1099,
    cost_price: 850,
    wholesale_price: 950,
    is_serialized: true,
    is_batched: false,
    is_active: true,
    min_stock_level: 5,
    max_stock_level: 50,
    reorder_quantity: 10,
    lead_time_days: 5,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "3",
    sku: "APL-MBP14-M3",
    name: "MacBook Pro 14\" M3",
    description: "Apple MacBook Pro with M3 chip",
    category_id: "2",
    brand_id: "1",
    unit_price: 1999,
    cost_price: 1600,
    wholesale_price: 1750,
    is_serialized: true,
    is_batched: false,
    is_active: true,
    min_stock_level: 3,
    max_stock_level: 20,
    reorder_quantity: 5,
    lead_time_days: 14,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "4",
    sku: "APL-APP2",
    name: "AirPods Pro 2nd Gen",
    description: "Apple wireless earbuds",
    category_id: "5",
    brand_id: "1",
    unit_price: 249,
    cost_price: 180,
    wholesale_price: 210,
    is_serialized: false,
    is_batched: false,
    is_active: true,
    min_stock_level: 10,
    max_stock_level: 100,
    reorder_quantity: 20,
    lead_time_days: 3,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "5",
    sku: "ACC-USBC-65W",
    name: "USB-C Fast Charger 65W",
    description: "Universal USB-C fast charger",
    category_id: "4",
    brand_id: "3",
    unit_price: 45,
    cost_price: 22,
    wholesale_price: 30,
    is_serialized: false,
    is_batched: true,
    is_active: true,
    min_stock_level: 20,
    max_stock_level: 200,
    reorder_quantity: 50,
    lead_time_days: 7,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "6",
    sku: "SAM-TAB-S9",
    name: "Samsung Galaxy Tab S9",
    description: "Samsung premium tablet",
    category_id: "3",
    brand_id: "2",
    unit_price: 849,
    cost_price: 650,
    wholesale_price: 720,
    is_serialized: true,
    is_batched: false,
    is_active: true,
    min_stock_level: 3,
    max_stock_level: 30,
    reorder_quantity: 5,
    lead_time_days: 7,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 234 567 8901",
    address: "123 Main St, New York, NY",
    credit_limit: 5000,
    credit_balance: 1250,
    is_active: true,
    created_at: "2024-01-15",
  },
  {
    id: "2",
    name: "ABC Corporation",
    email: "accounts@abccorp.com",
    phone: "+1 234 567 8902",
    address: "456 Business Ave, Los Angeles, CA",
    credit_limit: 50000,
    credit_balance: 12500,
    is_active: true,
    created_at: "2024-01-10",
  },
  {
    id: "3",
    name: "Sarah Davis",
    email: "sarah.d@email.com",
    phone: "+1 234 567 8903",
    address: "789 Oak Lane, Chicago, IL",
    credit_limit: 2000,
    credit_balance: 0,
    is_active: true,
    created_at: "2024-01-20",
  },
  {
    id: "4",
    name: "Tech Solutions Inc",
    email: "info@techsolutions.com",
    phone: "+1 234 567 8904",
    address: "321 Innovation Blvd, San Francisco, CA",
    credit_limit: 25000,
    credit_balance: 5240,
    is_active: true,
    created_at: "2024-01-05",
  },
  {
    id: "5",
    name: "Michael Brown",
    email: "m.brown@email.com",
    phone: "+1 234 567 8905",
    address: "654 Pine St, Seattle, WA",
    credit_limit: 0,
    credit_balance: 0,
    is_active: false,
    created_at: "2024-01-25",
  },
];

export const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Apple Inc.",
    contact_person: "Tim Cook",
    email: "suppliers@apple.com",
    phone: "+1 800 692 7753",
    address: "One Apple Park Way, Cupertino, CA",
    is_active: true,
    created_at: "2024-01-01",
  },
  {
    id: "2",
    name: "Samsung Electronics",
    contact_person: "James Lee",
    email: "b2b@samsung.com",
    phone: "+1 800 726 7864",
    address: "85 Challenger Rd, Ridgefield Park, NJ",
    is_active: true,
    created_at: "2024-01-01",
  },
  {
    id: "3",
    name: "Generic Accessories Ltd",
    contact_person: "Bob Wilson",
    email: "sales@genericacc.com",
    phone: "+1 555 123 4567",
    address: "123 Industrial Way, Newark, NJ",
    is_active: true,
    created_at: "2024-01-01",
  },
  {
    id: "4",
    name: "Tech Distributors Inc",
    contact_person: "Alice Chen",
    email: "orders@techdist.com",
    phone: "+1 555 987 6543",
    address: "456 Commerce Blvd, Chicago, IL",
    is_active: true,
    created_at: "2024-01-01",
  },
  {
    id: "5",
    name: "Mobile Accessories Co",
    contact_person: "Mike Johnson",
    email: "info@mobileacc.com",
    phone: "+1 555 246 8135",
    address: "789 Tech Park, Austin, TX",
    is_active: false,
    created_at: "2024-01-01",
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoice_number: "INV-2024-0001",
    invoice_type: "sale",
    status: "paid",
    customer_id: "1",
    branch_id: "1",
    subtotal: 1199,
    discount_amount: 0,
    tax_amount: 95.92,
    total_amount: 1294.92,
    paid_amount: 1294.92,
    notes: null,
    created_at: "2024-01-15T10:30:00Z",
    created_by: "1",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    invoice_number: "INV-2024-0002",
    invoice_type: "sale",
    status: "pending",
    customer_id: "2",
    branch_id: "1",
    subtotal: 2198,
    discount_amount: 100,
    tax_amount: 167.84,
    total_amount: 2265.84,
    paid_amount: 0,
    notes: "Corporate order",
    created_at: "2024-01-18T14:00:00Z",
    created_by: "1",
    updated_at: "2024-01-18T14:00:00Z",
  },
  {
    id: "3",
    invoice_number: "INV-2024-0003",
    invoice_type: "quotation",
    status: "draft",
    customer_id: "3",
    branch_id: "2",
    subtotal: 1999,
    discount_amount: 0,
    tax_amount: 159.92,
    total_amount: 2158.92,
    paid_amount: 0,
    notes: null,
    created_at: "2024-01-20T09:15:00Z",
    created_by: "1",
    updated_at: "2024-01-20T09:15:00Z",
  },
  {
    id: "4",
    invoice_number: "INV-2024-0004",
    invoice_type: "sale",
    status: "partial",
    customer_id: "4",
    branch_id: "1",
    subtotal: 3497,
    discount_amount: 200,
    tax_amount: 263.76,
    total_amount: 3560.76,
    paid_amount: 2000,
    notes: "Partial payment received",
    created_at: "2024-01-22T11:45:00Z",
    created_by: "1",
    updated_at: "2024-01-22T11:45:00Z",
  },
  {
    id: "5",
    invoice_number: "INV-2024-0005",
    invoice_type: "sale",
    status: "paid",
    customer_id: null,
    branch_id: "1",
    subtotal: 249,
    discount_amount: 0,
    tax_amount: 19.92,
    total_amount: 268.92,
    paid_amount: 268.92,
    notes: "Walk-in customer",
    created_at: "2024-01-25T16:20:00Z",
    created_by: "1",
    updated_at: "2024-01-25T16:20:00Z",
  },
];

export const mockInvoiceItems: InvoiceItem[] = [
  { id: "1", invoice_id: "1", product_id: "1", quantity: 1, unit_price: 1199, discount_percent: 0, tax_percent: 8, total: 1294.92 },
  { id: "2", invoice_id: "2", product_id: "1", quantity: 1, unit_price: 1199, discount_percent: 0, tax_percent: 8, total: 1294.92 },
  { id: "3", invoice_id: "2", product_id: "2", quantity: 1, unit_price: 1099, discount_percent: 100, tax_percent: 8, total: 1079.92 },
  { id: "4", invoice_id: "3", product_id: "3", quantity: 1, unit_price: 1999, discount_percent: 0, tax_percent: 8, total: 2158.92 },
  { id: "5", invoice_id: "4", product_id: "1", quantity: 1, unit_price: 1199, discount_percent: 100, tax_percent: 8, total: 1186.92 },
  { id: "6", invoice_id: "4", product_id: "2", quantity: 1, unit_price: 1099, discount_percent: 50, tax_percent: 8, total: 1132.92 },
  { id: "7", invoice_id: "4", product_id: "4", quantity: 2, unit_price: 249, discount_percent: 25, tax_percent: 8, total: 510.92 },
  { id: "8", invoice_id: "5", product_id: "4", quantity: 1, unit_price: 249, discount_percent: 0, tax_percent: 8, total: 268.92 },
];

export const mockPayments: Payment[] = [
  { id: "1", invoice_id: "1", amount: 1294.92, payment_method: "card", reference: "TXN-001234", created_at: "2024-01-15T10:35:00Z", created_by: "1" },
  { id: "2", invoice_id: "4", amount: 2000, payment_method: "bank_transfer", reference: "BT-789456", created_at: "2024-01-23T09:00:00Z", created_by: "1" },
  { id: "3", invoice_id: "5", amount: 268.92, payment_method: "cash", reference: null, created_at: "2024-01-25T16:25:00Z", created_by: "1" },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    po_number: "PO-2024-0001",
    supplier_id: "1",
    branch_id: "1",
    status: "shipped",
    total_amount: 125000,
    expected_delivery: "2024-02-05",
    notes: null,
    created_at: "2024-01-25T08:00:00Z",
    created_by: "1",
    approved_at: "2024-01-25T10:00:00Z",
    approved_by: "1",
  },
  {
    id: "2",
    po_number: "PO-2024-0002",
    supplier_id: "2",
    branch_id: "1",
    status: "approved",
    total_amount: 85000,
    expected_delivery: "2024-02-01",
    notes: null,
    created_at: "2024-01-24T09:00:00Z",
    created_by: "1",
    approved_at: "2024-01-24T11:00:00Z",
    approved_by: "1",
  },
  {
    id: "3",
    po_number: "PO-2024-0003",
    supplier_id: "3",
    branch_id: "3",
    status: "received",
    total_amount: 12500,
    expected_delivery: "2024-01-28",
    notes: "Bulk accessories order",
    created_at: "2024-01-22T10:00:00Z",
    created_by: "1",
    approved_at: "2024-01-22T12:00:00Z",
    approved_by: "1",
  },
  {
    id: "4",
    po_number: "PO-2024-0004",
    supplier_id: "4",
    branch_id: "1",
    status: "partial",
    total_amount: 45000,
    expected_delivery: "2024-01-30",
    notes: null,
    created_at: "2024-01-20T11:00:00Z",
    created_by: "1",
    approved_at: "2024-01-20T14:00:00Z",
    approved_by: "1",
  },
  {
    id: "5",
    po_number: "PO-2024-0005",
    supplier_id: "5",
    branch_id: "2",
    status: "pending",
    total_amount: 8500,
    expected_delivery: "2024-02-10",
    notes: null,
    created_at: "2024-01-26T07:00:00Z",
    created_by: "1",
    approved_at: null,
    approved_by: null,
  },
];

export const mockProfiles: Profile[] = [
  {
    id: "1",
    user_id: "1",
    email: "admin@gmail.com",
    full_name: "Admin User",
    avatar_url: null,
    approval_status: "approved",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

export const mockUserRoles: UserRole[] = [
  { id: "1", user_id: "1", role: "admin" },
];

// Helper functions to get related data
export function getInvoiceWithDetails(invoiceId: string): Invoice | undefined {
  const invoice = mockInvoices.find(i => i.id === invoiceId);
  if (!invoice) return undefined;
  
  const customer = mockCustomers.find(c => c.id === invoice.customer_id);
  const items = mockInvoiceItems
    .filter(item => item.invoice_id === invoiceId)
    .map(item => ({
      ...item,
      product: mockProducts.find(p => p.id === item.product_id),
    }));
  
  return {
    ...invoice,
    customer: customer || null,
    items,
  };
}

export function getAllInvoicesWithDetails(): Invoice[] {
  return mockInvoices.map(invoice => {
    const customer = mockCustomers.find(c => c.id === invoice.customer_id);
    const items = mockInvoiceItems
      .filter(item => item.invoice_id === invoice.id)
      .map(item => ({
        ...item,
        product: mockProducts.find(p => p.id === item.product_id),
      }));
    
    return {
      ...invoice,
      customer: customer || null,
      items,
    };
  });
}

export function getPurchaseOrderWithDetails(poId: string): PurchaseOrder | undefined {
  const po = mockPurchaseOrders.find(p => p.id === poId);
  if (!po) return undefined;
  
  const supplier = mockSuppliers.find(s => s.id === po.supplier_id);
  
  return {
    ...po,
    supplier: supplier || null,
  };
}
