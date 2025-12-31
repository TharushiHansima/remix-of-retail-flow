import { useState } from "react";
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

const jobCardSchema = z.object({
  customerName: z.string().min(1, "Customer name is required").max(100),
  customerPhone: z.string().min(1, "Phone number is required").max(20),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  device: z.string().min(1, "Device is required").max(100),
  serialNumber: z.string().max(50).optional(),
  issue: z.string().min(1, "Issue description is required").max(500),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  warranty: z.boolean(),
  technician: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

type JobCardFormData = z.infer<typeof jobCardSchema>;

interface CreateJobCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const technicians = [
  { id: "1", name: "Mike Johnson" },
  { id: "2", name: "Alex Chen" },
  { id: "3", name: "Sarah Wilson" },
];

export function CreateJobCardDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateJobCardDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JobCardFormData>({
    resolver: zodResolver(jobCardSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      device: "",
      serialNumber: "",
      issue: "",
      priority: "normal",
      warranty: false,
      technician: "",
      notes: "",
    },
  });

  const onSubmit = async (data: JobCardFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Integrate with backend
      console.log("Creating job card:", data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      toast.success("Job card created successfully");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create job card");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job Card</DialogTitle>
          <DialogDescription>
            Enter the details for the new repair or service job.
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
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 234 567 8901" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        <Input placeholder="iPhone 15 Pro Max" {...field} />
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
                        <Input placeholder="DNRX12345678" {...field} />
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
                      <Textarea
                        placeholder="Describe the issue or repair needed..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Job Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Job Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormLabel>Assign Technician</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select technician" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover">
                          <SelectItem value="">Unassigned</SelectItem>
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
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes or instructions..."
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
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
                {isSubmitting ? "Creating..." : "Create Job Card"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
