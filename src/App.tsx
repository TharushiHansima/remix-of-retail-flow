import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Products from "./pages/Products";
import CategoriesBrands from "./pages/CategoriesBrands";
import StockOverview from "./pages/StockOverview";
import SerialRegistry from "./pages/SerialRegistry";
import JobCards from "./pages/JobCards";
import TechnicianBoard from "./pages/TechnicianBoard";
import Estimates from "./pages/Estimates";
import ServiceBilling from "./pages/ServiceBilling";
import WarrantyJobs from "./pages/WarrantyJobs";
import Customers from "./pages/Customers";
import SalesReports from "./pages/SalesReports";
import InventoryReports from "./pages/InventoryReports";
import RepairReports from "./pages/RepairReports";
import FinancialSummary from "./pages/FinancialSummary";
import PurchaseOrders from "./pages/PurchaseOrders";
import Suppliers from "./pages/Suppliers";
import ImportBatches from "./pages/ImportBatches";
import UsersRoles from "./pages/UsersRoles";
import Invoices from "./pages/Invoices";
import Quotations from "./pages/Quotations";
import ReturnsRefunds from "./pages/ReturnsRefunds";
import Payments from "./pages/Payments";
import GRN from "./pages/GRN";
import StockTransfers from "./pages/StockTransfers";
import StockAdjustments from "./pages/StockAdjustments";
import CreditAccounts from "./pages/CreditAccounts";
import ReceivablesAging from "./pages/ReceivablesAging";
import ServiceHistory from "./pages/ServiceHistory";
import ModulesConfig from "./pages/config/ModulesConfig";
import SystemSettings from "./pages/config/SystemSettings";
import WorkflowsConfig from "./pages/config/WorkflowsConfig";
import ApprovalsConfig from "./pages/config/ApprovalsConfig";
import TaxPricing from "./pages/config/TaxPricing";
import BranchSetup from "./pages/config/BranchSetup";
import AuditTrail from "./pages/config/AuditTrail";
import SecuritySettings from "./pages/config/SecuritySettings";
import CompanySettings from "./pages/config/CompanySettings";
import Approvals from "./pages/Approvals";
import UserApprovals from "./pages/UserApprovals";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Settings from "./pages/Settings";
import CashDrawer from "./pages/CashDrawer";
import PettyCash from "./pages/PettyCash";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ConfigProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/pos" element={<POS />} />
                    <Route path="/cash-drawer" element={<CashDrawer />} />
                    <Route path="/petty-cash" element={<PettyCash />} />
                    <Route path="/sales/invoices" element={<Invoices />} />
                    <Route path="/sales/quotations" element={<Quotations />} />
                    <Route path="/sales/returns" element={<ReturnsRefunds />} />
                    <Route path="/sales/payments" element={<Payments />} />
                    <Route path="/inventory/products" element={<Products />} />
                    <Route path="/inventory/categories" element={<CategoriesBrands />} />
                    <Route path="/inventory/stock" element={<StockOverview />} />
                    <Route path="/inventory/serials" element={<SerialRegistry />} />
                    <Route path="/inventory/transfers" element={<StockTransfers />} />
                    <Route path="/inventory/adjustments" element={<StockAdjustments />} />
                    <Route path="/repairs/jobs" element={<JobCards />} />
                    <Route path="/repairs/board" element={<TechnicianBoard />} />
                    <Route path="/repairs/estimates" element={<Estimates />} />
                    <Route path="/repairs/billing" element={<ServiceBilling />} />
                    <Route path="/repairs/warranty" element={<WarrantyJobs />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/customers/credit" element={<CreditAccounts />} />
                    <Route path="/customers/receivables" element={<ReceivablesAging />} />
                    <Route path="/customers/history" element={<ServiceHistory />} />
                    <Route path="/reports/sales" element={<SalesReports />} />
                    <Route path="/reports/inventory" element={<InventoryReports />} />
                    <Route path="/reports/repairs" element={<RepairReports />} />
                    <Route path="/reports/financial" element={<FinancialSummary />} />
                    <Route path="/suppliers" element={<Navigate to="/suppliers/list" replace />} />
                    <Route path="/suppliers/orders" element={<PurchaseOrders />} />
                    <Route path="/suppliers/list" element={<Suppliers />} />
                    <Route path="/suppliers/batches" element={<ImportBatches />} />
                    <Route path="/suppliers/grn" element={<GRN />} />
                    <Route path="/config/users" element={<UsersRoles />} />
                    <Route path="/config/user-approvals" element={<UserApprovals />} />
                    <Route path="/config/modules" element={<ModulesConfig />} />
                    <Route path="/config/system" element={<SystemSettings />} />
                    <Route path="/config/workflows" element={<WorkflowsConfig />} />
                    <Route path="/config/approvals" element={<ApprovalsConfig />} />
                    <Route path="/config/tax" element={<TaxPricing />} />
                    <Route path="/config/branches" element={<BranchSetup />} />
                    <Route path="/config/audit-trail" element={<AuditTrail />} />
                    <Route path="/config/security" element={<SecuritySettings />} />
                    <Route path="/config/company" element={<CompanySettings />} />
                    <Route path="/approvals" element={<Approvals />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ConfigProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
