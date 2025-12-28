import { Bell, Search, ChevronDown, User, LogOut, Settings, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface AppHeaderProps {
  sidebarCollapsed: boolean;
}

export function AppHeader({ sidebarCollapsed }: AppHeaderProps) {
  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-card border-b border-border transition-all duration-300 ${
        sidebarCollapsed ? "left-16" : "left-64"
      }`}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Branch Selector */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <span className="font-medium">Main Branch</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-popover">
              <DropdownMenuItem>Main Branch</DropdownMenuItem>
              <DropdownMenuItem>Downtown Store</DropdownMenuItem>
              <DropdownMenuItem>Warehouse</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-popover">
              <div className="p-3 border-b border-border">
                <h4 className="font-semibold">Notifications</h4>
              </div>
              <div className="max-h-80 overflow-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <span className="font-medium text-sm">Low Stock Alert</span>
                  <span className="text-xs text-muted-foreground">
                    iPhone 15 Pro Max - Only 2 units left
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <span className="font-medium text-sm">Pending Approval</span>
                  <span className="text-xs text-muted-foreground">
                    Discount request #1234 needs review
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <span className="font-medium text-sm">Overdue Repair</span>
                  <span className="text-xs text-muted-foreground">
                    Job card #JC-2024-0089 exceeded SLA
                  </span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">JD</span>
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Store Manager</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
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
