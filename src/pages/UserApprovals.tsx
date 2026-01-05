import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const roleLabels: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  cashier: "Cashier",
  storekeeper: "Store Keeper",
  technician: "Technician",
  accountant: "Accountant",
};

export default function UserApprovals() {
  const { pendingUsers, approveUser, rejectUser, hasRole } = useAuth();
  const { toast } = useToast();

  const handleApprove = (userId: string, userName: string) => {
    approveUser(userId);
    toast({
      title: "User Approved",
      description: `${userName} has been approved and can now login.`,
    });
  };

  const handleReject = (userId: string, userName: string) => {
    rejectUser(userId);
    toast({
      variant: "destructive",
      title: "User Rejected",
      description: `${userName}'s account request has been rejected.`,
    });
  };

  // Filter out already rejected users for display
  const pendingForApproval = pendingUsers.filter(u => u.approval_status === "pending");
  const rejectedUsers = pendingUsers.filter(u => u.approval_status === "rejected");

  if (!hasRole("admin")) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page. Only administrators can manage user approvals.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve new user registrations
        </p>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <CardTitle>Pending Approvals</CardTitle>
          </div>
          <CardDescription>
            Users waiting for account approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingForApproval.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserPlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No Pending Approvals</h3>
              <p className="text-sm text-muted-foreground mt-1">
                All user registration requests have been processed.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingForApproval.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {roleLabels[user.role] || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleApprove(user.id, user.full_name)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleReject(user.id, user.full_name)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Rejected Users */}
      {rejectedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <CardTitle>Rejected Users</CardTitle>
            </div>
            <CardDescription>
              Users whose registration was rejected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rejectedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {roleLabels[user.role] || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">Rejected</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
