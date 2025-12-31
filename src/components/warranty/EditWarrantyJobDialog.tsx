import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface WarrantyJob {
  id: string;
  jobNumber: string;
  customer: string;
  phone: string;
  email?: string;
  device: string;
  serialNumber: string;
  issue: string;
  status: "pending" | "in_progress" | "approved" | "rejected" | "completed";
  warrantyType: "manufacturer" | "extended" | "store";
  warrantyExpiry: string;
  purchaseDate: string;
  claimStatus: "pending" | "submitted" | "approved" | "rejected";
  claimAmount?: number;
  createdAt: string;
  technician?: string;
  notes?: string;
}

interface EditWarrantyJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: WarrantyJob | null;
  onSave: (job: WarrantyJob) => void;
}

export function EditWarrantyJobDialog({ open, onOpenChange, job, onSave }: EditWarrantyJobDialogProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [device, setDevice] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [issue, setIssue] = useState("");
  const [status, setStatus] = useState<WarrantyJob["status"]>("pending");
  const [warrantyType, setWarrantyType] = useState<WarrantyJob["warrantyType"]>("manufacturer");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [claimStatus, setClaimStatus] = useState<WarrantyJob["claimStatus"]>("pending");
  const [claimAmount, setClaimAmount] = useState<number | undefined>(undefined);
  const [technician, setTechnician] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (job) {
      setCustomerName(job.customer);
      setCustomerPhone(job.phone);
      setCustomerEmail(job.email || "");
      setDevice(job.device);
      setSerialNumber(job.serialNumber);
      setIssue(job.issue);
      setStatus(job.status);
      setWarrantyType(job.warrantyType);
      setWarrantyExpiry(job.warrantyExpiry);
      setPurchaseDate(job.purchaseDate);
      setClaimStatus(job.claimStatus);
      setClaimAmount(job.claimAmount);
      setTechnician(job.technician || "");
      setNotes(job.notes || "");
    }
  }, [job]);

  const handleSubmit = () => {
    if (!customerName || !device || !serialNumber || !issue) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (job) {
      onSave({
        ...job,
        customer: customerName,
        phone: customerPhone,
        email: customerEmail,
        device,
        serialNumber,
        issue,
        status,
        warrantyType,
        warrantyExpiry,
        purchaseDate,
        claimStatus,
        claimAmount,
        technician: technician || undefined,
        notes: notes || undefined,
      });
    }
    toast.success("Warranty job updated successfully");
    onOpenChange(false);
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Warranty Job - {job.jobNumber}</DialogTitle>
          <DialogDescription>
            Update the warranty job details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Device Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="device">Device *</Label>
                <Input
                  id="device"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  placeholder="e.g., iPhone 15 Pro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number *</Label>
                <Input
                  id="serialNumber"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Enter serial number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue">Issue Description *</Label>
              <Textarea
                id="issue"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Describe the issue"
                rows={3}
              />
            </div>
          </div>

          {/* Status & Assignment */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Status & Assignment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Job Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as WarrantyJob["status"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="technician">Assign Technician</Label>
                <Select value={technician} onValueChange={setTechnician}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="Alex Chen">Alex Chen</SelectItem>
                    <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                    <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Warranty Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Warranty Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warrantyType">Warranty Type</Label>
                <Select value={warrantyType} onValueChange={(value) => setWarrantyType(value as WarrantyJob["warrantyType"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="extended">Extended</SelectItem>
                    <SelectItem value="store">Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="claimStatus">Claim Status</Label>
                <Select value={claimStatus} onValueChange={(value) => setClaimStatus(value as WarrantyJob["claimStatus"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiry"
                  type="date"
                  value={warrantyExpiry}
                  onChange={(e) => setWarrantyExpiry(e.target.value)}
                />
              </div>
              {claimStatus === "approved" && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="claimAmount">Claim Amount</Label>
                  <Input
                    id="claimAmount"
                    type="number"
                    min={0}
                    step={0.01}
                    value={claimAmount || ""}
                    onChange={(e) => setClaimAmount(parseFloat(e.target.value) || undefined)}
                    placeholder="Enter approved claim amount"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
