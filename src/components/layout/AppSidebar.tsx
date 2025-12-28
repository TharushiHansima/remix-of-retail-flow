import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Wrench,
  Users,
  Truck,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: { title: string; href: string }[];
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Sales & POS",
    icon: ShoppingCart,
    children: [
      { title: "POS Billing", href: "/pos" },
      { title: "Sales Invoices", href: "/sales/invoices" },
      { title: "Quotations", href: "/sales/quotations" },
      { title: "Returns & Refunds", href: "/sales/returns" },
      { title: "Payments", href: "/sales/payments" },
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    children: [
      { title: "Products", href: "/inventory/products" },
      { title: "Categories & Brands", href: "/inventory/categories" },
      { title: "Stock Overview", href: "/inventory/stock" },
      { title: "Serial Registry", href: "/inventory/serials" },
      { title: "Stock Transfers", href: "/inventory/transfers" },
      { title: "Stock Adjustments", href: "/inventory/adjustments" },
    ],
  },
  {
    title: "Repairs & Service",
    icon: Wrench,
    children: [
      { title: "Job Cards", href: "/repairs/jobs" },
      { title: "Technician Board", href: "/repairs/board" },
      { title: "Estimates", href: "/repairs/estimates" },
      { title: "Service Billing", href: "/repairs/billing" },
      { title: "Warranty Jobs", href: "/repairs/warranty" },
    ],
  },
  {
    title: "Customers",
    icon: Users,
    children: [
      { title: "Customer List", href: "/customers" },
      { title: "Credit Accounts", href: "/customers/credit" },
      { title: "Receivables Aging", href: "/customers/receivables" },
      { title: "Service History", href: "/customers/history" },
    ],
  },
  {
    title: "Suppliers",
    icon: Truck,
    children: [
      { title: "Supplier List", href: "/suppliers" },
      { title: "Purchase Orders", href: "/suppliers/orders" },
      { title: "GRN", href: "/suppliers/grn" },
      { title: "Import Batches", href: "/suppliers/imports" },
    ],
  },
  {
    title: "Reports",
    icon: BarChart3,
    children: [
      { title: "Sales Reports", href: "/reports/sales" },
      { title: "Inventory Reports", href: "/reports/inventory" },
      { title: "Repair Reports", href: "/reports/repairs" },
      { title: "Financial Summary", href: "/reports/financial" },
    ],
  },
  {
    title: "Configuration",
    icon: Settings,
    children: [
      { title: "Users & Roles", href: "/config/users" },
      { title: "Approval Rules", href: "/config/approvals" },
      { title: "Tax & Pricing", href: "/config/tax" },
      { title: "Branch Setup", href: "/config/branches" },
    ],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export function AppSidebar({ collapsed, onCollapse }: AppSidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Sales & POS", "Inventory", "Repairs & Service"]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => location.pathname === href;
  const isChildActive = (children?: { href: string }[]) =>
    children?.some((child) => location.pathname === child.href);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-sm">DC</span>
            </div>
            <span className="font-semibold text-sidebar-foreground">DevLabCo</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCollapse(!collapsed)}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <nav className="p-2 space-y-1">
          {navigation.map((item) => (
            <div key={item.title}>
              {item.href ? (
                <NavLink
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              ) : (
                <>
                  <button
                    onClick={() => !collapsed && toggleExpand(item.title)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      isChildActive(item.children)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        {expandedItems.includes(item.title) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </button>
                  {!collapsed && expandedItems.includes(item.title) && item.children && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.href}
                          to={child.href}
                          className={cn(
                            "block px-3 py-2 rounded-md text-sm transition-colors",
                            isActive(child.href)
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          )}
                        >
                          {child.title}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
