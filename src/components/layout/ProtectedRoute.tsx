import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProtectedRoute() {
  const { user, isLoading, isApproved, isPendingApproval, profile, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show pending approval screen
  if (isPendingApproval) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle>Account Pending Approval</CardTitle>
            <CardDescription>
              Your account is waiting for admin approval. You'll be able to access the system once approved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Signed in as: <strong>{profile?.email}</strong></p>
            </div>
            <Button variant="outline" className="w-full" onClick={signOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show rejected screen
  if (profile?.approval_status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle>Account Access Denied</CardTitle>
            <CardDescription>
              Your account access request has been rejected. Please contact an administrator for more information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Signed in as: <strong>{profile?.email}</strong></p>
            </div>
            <Button variant="outline" className="w-full" onClick={signOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Outlet />;
}
