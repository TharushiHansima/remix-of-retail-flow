import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, Plus, Phone, Mail } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  creditLimit?: number;
  creditBalance?: number;
}

interface CustomerSelectDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (customer: Customer | null) => void;
  customers: Customer[];
}

export function CustomerSelectDialog({
  open,
  onClose,
  onSelect,
  customers,
}: CustomerSelectDialogProps) {
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleWalkIn = () => {
    onSelect(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select Customer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-dashed"
            onClick={handleWalkIn}
          >
            <User className="h-4 w-4" />
            Walk-in Customer
          </Button>

          <div className="max-h-64 overflow-auto space-y-2">
            {filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => {
                  onSelect(customer);
                  onClose();
                }}
                className="w-full p-3 bg-secondary/30 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-left"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">{customer.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </span>
                    </div>
                  </div>
                  {customer.creditLimit && (
                    <Badge variant="secondary" className="text-xs">
                      Credit: ${customer.creditBalance?.toFixed(2) || "0.00"}
                    </Badge>
                  )}
                </div>
              </button>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No customers found</p>
              </div>
            )}
          </div>

          <Button variant="outline" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add New Customer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
