import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Receipt,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import type { Customer } from "@/features/customers/customers.types";

interface ViewCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

export function ViewCustomerDialog({
  open,
  onOpenChange,
  customer,
}: ViewCustomerDialogProps) {
  if (!customer) return null;

  const status = customer.isActive ? "active" : "inactive";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Customer Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {(customer.name || "NA")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{customer.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  {customer.type === "business" ? "Business" : "Individual"}
                </Badge>
                <Badge
                  className={
                    status === "active"
                      ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Contact Information
            </h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{customer.email || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{customer.phone || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{customer.address || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Financial Summary
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Credit Limit</span>
                </div>
                <p className="text-lg font-semibold">
                  ${Number(customer.creditLimit || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Outstanding</span>
                </div>
                <p
                  className={`text-lg font-semibold ${
                    Number(customer.balance || 0) > 0
                      ? "text-[hsl(var(--warning))]"
                      : "text-[hsl(var(--success))]"
                  }`}
                >
                  ${Number(customer.balance || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Purchases</span>
                </div>
                <p className="text-lg font-semibold text-[hsl(var(--success))]">
                  ${Number(customer.totalPurchases || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Last Visit</span>
                </div>
                <p className="text-lg font-semibold">{customer.lastVisit || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
