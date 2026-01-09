import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, User, LogOut, Settings, Key, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { toast } from "sonner";

// ✅ backend branches API
import { listBranches } from "@/features/branches/branches.api";
import type { Branch } from "@/features/branches/branches.types";

interface AppHeaderProps {
  sidebarCollapsed: boolean;
}

const BRANCH_STORAGE_KEY = "erp.branchId";

export function AppHeader({ sidebarCollapsed }: AppHeaderProps) {
  const navigate = useNavigate();
  const { profile, roles, signOut } = useAuth();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    localStorage.getItem(BRANCH_STORAGE_KEY) || profile?.branch_id || ""
  );

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const userInitials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : profile?.email?.slice(0, 2).toUpperCase() || "U";

  const userRole = roles[0]?.role || "User";

  // Check if user has admin or manager role
  const canSeeBranchSelector = useMemo(() => {
    const role = roles[0]?.role;
    return role === "admin" || role === "manager";
  }, [roles]);

  // ✅ Load branches once (header is after login, so token exists)
  useEffect(() => {
    // Only load branches if user can see the selector
    if (!canSeeBranchSelector) return;

    const load = async () => {
      try {
        setBranchesLoading(true);

        const data = await listBranches({ includeDisabled: false });

        const active = Array.isArray(data) ? data.filter((b) => (b.isActive ?? true) === true) : [];
        setBranches(active);

        // pick default branch:
        const stored = localStorage.getItem(BRANCH_STORAGE_KEY) || "";
        const fromProfile = profile?.branch_id || "";
        const defaultId = stored || fromProfile || active[0]?.id || "";

        if (defaultId) {
          setSelectedBranchId(defaultId);
          localStorage.setItem(BRANCH_STORAGE_KEY, defaultId);
        }
      } catch (err: any) {
        console.error("Failed to load branches:", err);
        toast.error(err?.message || "Failed to load branches");
      } finally {
        setBranchesLoading(false);
      }
    };

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSeeBranchSelector]);

  // ✅ If profile.branch_id changes later, sync selection only if nothing selected yet
  useEffect(() => {
    if (!selectedBranchId && profile?.branch_id) {
      setSelectedBranchId(profile.branch_id);
      localStorage.setItem(BRANCH_STORAGE_KEY, profile.branch_id);
    }
  }, [profile?.branch_id, selectedBranchId]);

  const selectedBranch = useMemo(() => {
    return branches.find((b) => b.id === selectedBranchId) || null;
  }, [branches, selectedBranchId]);

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
    localStorage.setItem(BRANCH_STORAGE_KEY, branchId);

    const name = branches.find((b) => b.id === branchId)?.name;
    if (name) toast.success(`Switched to ${name}`);
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-card border-b border-border transition-all duration-300 ${
        sidebarCollapsed ? "left-16" : "left-64"
      }`}
    >
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {/* Branch Selector - Only for admin and manager */}
          {canSeeBranchSelector && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2" disabled={branchesLoading}>
                  <span className="font-medium">
                    {branchesLoading
                      ? "Loading..."
                      : selectedBranch?.name || "Select Branch"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-56 bg-popover">
                {branches.length === 0 ? (
                  <DropdownMenuItem disabled>
                    {branchesLoading ? "Loading branches..." : "No branches found"}
                  </DropdownMenuItem>
                ) : (
                  branches.map((b) => {
                    const active = b.isActive ?? true;
                    if (!active) return null;

                    const isSelected = b.id === selectedBranchId;

                    return (
                      <DropdownMenuItem key={b.id} onClick={() => handleSelectBranch(b.id)}>
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate">{b.name}</span>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Global Search */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, customers, invoices..."
              className="pl-10 bg-secondary/50"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NotificationCenter />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">{userInitials}</span>
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium">{profile?.full_name || profile?.email || "User"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 bg-popover">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/change-password")}>
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
