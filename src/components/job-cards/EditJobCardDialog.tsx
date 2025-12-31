import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface JobCard {
  id: string;
  jobNumber: string;
  customer: string;
  phone: string;
  device: string;
  serialNumber: string;
  issue: string;
  status: "received" | "diagnosing" | "waiting_parts" | "repairing" | "testing" | "completed";
  priority: "low" | "normal" | "high" | "urgent";
  warranty: boolean;
  technician?: string;
  createdAt: string;
  dueDate: string;
  slaHours: number;
}

const jobCardSchema = z.object({
  customer: z.string().min(1, "Customer name is required").max(100),
  phone: z.string().min(1, "Phone number is required").max(20),
  device: z.string().min(1, "Device is required").max(100),
  serialNumber: z.string().max(50),
  issue: z.string().min(1, "Issue description is required").max(500),
  status: z.enum(["received", "diagnosing", "waiting_parts", "repairing", "testing", "completed"]),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  warranty: z.boolean(),
  technician: z.string().optional(),
});

type JobCardFormData = z.infer<typeof jobCardSchema>;

interface EditJobCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobCard | null;
  onSuccess?: () => void;
}

const technicians = [
  { id: "1", name: "Mike Johnson" },
  { id: "2", name: "Alex Chen" },
  { id: "3", name: "Sarah Wilson" },
];

export function EditJobCardDialog({
  open,
  onOpenChange,
  job,
  onSuccess,
}: EditJobCardDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JobCardFormData>({
    resolver: zodResolver(jobCardSchema),
    defaultValues: {
      customer: "",
      phone: "",
      device: "",
      serialNumber: "",
      issue: "",
      status: "received",
      priority: "normal",
      warranty: false,
      technician: "unassigned",
    },
  });

  useEffect(() => {
    if (job) {
      form.reset({
        customer: job.customer,
        phone: job.phone,
        device: job.device,
        serialNumber: job.serialNumber,
        issue: job.issue,
        status: job.status,
        priority: job.priority,
        warranty: job.warranty,
        technician: job.technician || "unassigned",
      });
    }
  }, [job, form]);

  const onSubmit = async (data: JobCardFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Integrate with backend
      console.log("Updating job card:", data);
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      toast.success("Job card updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to update job card");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Card - {job.jobNumber}</DialogTitle>
          <DialogDescription>
            Update the details for this repair job.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Device Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Device Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="device"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="issue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Description *</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Job Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Job Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover">
                          <SelectItem value="received">Received</SelectItem>
                          <SelectItem value="diagnosing">Diagnosing</SelectItem>
                          <SelectItem value="waiting_parts">Waiting Parts</SelectItem>
                          <SelectItem value="repairing">Repairing</SelectItem>
                          <SelectItem value="testing">Testing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="technician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technician</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select technician" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover">
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.name}>
                              {tech.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="warranty"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Warranty Repair</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Is this repair covered under warranty?
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
