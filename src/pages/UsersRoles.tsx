import { useState } from "react";
import { Search, Plus, Shield, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branch: string;
  lastLogin: string;
  status: "active" | "inactive";
}

const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@devlabco.com",
    role: "Store Manager",
    branch: "Main Branch",
    lastLogin: "2024-01-28 09:15",
    status: "active",
  },
  {
    id: "2",
    name: "Mike Johnson",
    email: "mike.j@devlabco.com",
    role: "Senior Technician",
    branch: "Main Branch",
    lastLogin: "2024-01-28 08:30",
    status: "active",
  },
  {
    id: "3",
    name: "Alex Chen",
    email: "alex.c@devlabco.com",
    role: "Technician",
    branch: "Main Branch",
    lastLogin: "2024-01-28 08:45",
    status: "active",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.w@devlabco.com",
    role: "Cashier",
    branch: "Downtown Store",
    lastLogin: "2024-01-27 17:30",
    status: "active",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.b@devlabco.com",
    role: "Store Keeper",
    branch: "Warehouse",
    lastLogin: "2024-01-28 07:00",
    status: "active",
  },
  {
    id: "6",
    name: "Emily Davis",
    email: "emily.d@devlabco.com",
    role: "Accountant",
    branch: "Main Branch",
    lastLogin: "2024-01-25 14:20",
    status: "inactive",
  },
];

const roles = [
  { name: "Admin", permissions: 45, users: 1 },
  { name: "Store Manager", permissions: 38, users: 2 },
  { name: "Senior Technician", permissions: 22, users: 2 },
  { name: "Technician", permissions: 15, users: 3 },
  { name: "Cashier", permissions: 12, users: 4 },
  { name: "Store Keeper", permissions: 18, users: 2 },
  { name: "Accountant", permissions: 25, users: 1 },
];

export default function UsersRoles() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users & Roles</h1>
          <p className="text-muted-foreground">Manage system access and permissions</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-card-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.branch}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{user.lastLogin}</TableCell>
                    <TableCell>
                      <Switch checked={user.status === "active"} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Roles Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Roles</h3>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Role
            </Button>
          </div>

          <div className="bg-card rounded-lg border border-border shadow-sm divide-y divide-border">
            {roles.map((role) => (
              <div
                key={role.name}
                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{role.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {role.permissions} permissions • {role.users} users
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
