import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Products from "./pages/Products";
import JobCards from "./pages/JobCards";
import TechnicianBoard from "./pages/TechnicianBoard";
import Customers from "./pages/Customers";
import SalesReports from "./pages/SalesReports";
import PurchaseOrders from "./pages/PurchaseOrders";
import UsersRoles from "./pages/UsersRoles";
import Invoices from "./pages/Invoices";
import GRN from "./pages/GRN";
import StockTransfers from "./pages/StockTransfers";
import StockAdjustments from "./pages/StockAdjustments";
import ModulesConfig from "./pages/config/ModulesConfig";
import SystemSettings from "./pages/config/SystemSettings";
import WorkflowsConfig from "./pages/config/WorkflowsConfig";
import ApprovalsConfig from "./pages/config/ApprovalsConfig";
import TaxPricing from "./pages/config/TaxPricing";
import BranchSetup from "./pages/config/BranchSetup";
import Approvals from "./pages/Approvals";
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
                    <Route path="/sales/invoices" element={<Invoices />} />
                    <Route path="/inventory/products" element={<Products />} />
                    <Route path="/inventory/transfers" element={<StockTransfers />} />
                    <Route path="/inventory/adjustments" element={<StockAdjustments />} />
                    <Route path="/repairs/jobs" element={<JobCards />} />
                    <Route path="/repairs/board" element={<TechnicianBoard />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/reports/sales" element={<SalesReports />} />
                    <Route path="/suppliers/orders" element={<PurchaseOrders />} />
                    <Route path="/suppliers/grn" element={<GRN />} />
                    <Route path="/config/users" element={<UsersRoles />} />
                    <Route path="/config/modules" element={<ModulesConfig />} />
                    <Route path="/config/system" element={<SystemSettings />} />
                    <Route path="/config/workflows" element={<WorkflowsConfig />} />
                    <Route path="/config/approvals" element={<ApprovalsConfig />} />
                    <Route path="/config/tax" element={<TaxPricing />} />
                    <Route path="/config/branches" element={<BranchSetup />} />
                    <Route path="/approvals" element={<Approvals />} />
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
