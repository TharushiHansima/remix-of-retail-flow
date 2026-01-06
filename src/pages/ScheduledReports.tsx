import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Plus,
  Calendar,
  Mail,
  Clock,
  Trash2,
  Pencil,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface ScheduledReport {
  id: string;
  name: string;
  report_type: string;
  schedule_type: string;
  schedule_day: number | null;
  schedule_time: string;
  recipients: string[];
  format: string;
  is_active: boolean;
  last_sent_at: string | null;
  created_at: string;
}

interface ReportForm {
  name: string;
  report_type: string;
  schedule_type: string;
  schedule_day: number | null;
  schedule_time: string;
  recipients: string;
  format: string;
}

const emptyForm: ReportForm = {
  name: "",
  report_type: "sales",
  schedule_type: "daily",
  schedule_day: null,
  schedule_time: "08:00",
  recipients: "",
  format: "csv",
};

const reportTypes = [
  { value: "sales", label: "Sales Report" },
  { value: "inventory", label: "Inventory Report" },
  { value: "receivables", label: "Receivables Aging" },
  { value: "payables", label: "Payables Aging" },
  { value: "petty_cash", label: "Petty Cash" },
];

const scheduleTypes = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const weekDays = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const ScheduledReports = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
  const [form, setForm] = useState<ReportForm>(emptyForm);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["scheduled-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ScheduledReport[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ReportForm) => {
      const recipients = data.recipients.split(",").map((e) => e.trim()).filter(Boolean);
      if (recipients.length === 0) throw new Error("At least one recipient is required");

      const payload = {
        name: data.name,
        report_type: data.report_type,
        schedule_type: data.schedule_type,
        schedule_day: data.schedule_day,
        schedule_time: data.schedule_time,
        recipients,
        format: data.format,
        created_by: user?.id,
      };

      if (editingReport) {
        const { error } = await supabase
          .from("scheduled_reports")
          .update(payload)
          .eq("id", editingReport.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("scheduled_reports").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-reports"] });
      setDialogOpen(false);
      setEditingReport(null);
      setForm(emptyForm);
      toast.success(editingReport ? "Report updated" : "Report scheduled");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save report");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("scheduled_reports")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-reports"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scheduled_reports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-reports"] });
      toast.success("Report deleted");
    },
  });

  const handleEdit = (report: ScheduledReport) => {
    setEditingReport(report);
    setForm({
      name: report.name,
      report_type: report.report_type,
      schedule_type: report.schedule_type,
      schedule_day: report.schedule_day,
      schedule_time: report.schedule_time.slice(0, 5),
      recipients: report.recipients.join(", "),
      format: report.format,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("Report name is required");
      return;
    }
    saveMutation.mutate(form);
  };

  const getScheduleLabel = (report: ScheduledReport) => {
    if (report.schedule_type === "daily") {
      return `Daily at ${report.schedule_time.slice(0, 5)}`;
    }
    if (report.schedule_type === "weekly") {
      const day = weekDays.find((d) => d.value === report.schedule_day)?.label || "";
      return `${day} at ${report.schedule_time.slice(0, 5)}`;
    }
    return `Day ${report.schedule_day} at ${report.schedule_time.slice(0, 5)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scheduled Reports</h1>
          <p className="text-muted-foreground">
            Automate report delivery via email
          </p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setEditingReport(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter((r) => r.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <Pause className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter((r) => !r.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scheduled reports. Create your first schedule.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Last Sent</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>
                      {reportTypes.find((t) => t.value === report.report_type)?.label}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {getScheduleLabel(report)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {report.recipients.length} recipient(s)
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {report.last_sent_at
                        ? format(new Date(report.last_sent_at), "MMM d, yyyy")
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={report.is_active}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({ id: report.id, is_active: checked })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(report)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(report.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingReport ? "Edit Scheduled Report" : "Schedule New Report"}
            </DialogTitle>
            <DialogDescription>
              Configure automatic report delivery via email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report Name</Label>
              <Input
                placeholder="e.g., Weekly Sales Summary"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select
                  value={form.report_type}
                  onValueChange={(v) => setForm({ ...form, report_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={form.format}
                  onValueChange={(v) => setForm({ ...form, format: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={form.schedule_type}
                  onValueChange={(v) => setForm({ ...form, schedule_type: v, schedule_day: null })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.schedule_type === "weekly" && (
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select
                    value={form.schedule_day?.toString() || ""}
                    onValueChange={(v) => setForm({ ...form, schedule_day: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.schedule_type === "monthly" && (
                <div className="space-y-2">
                  <Label>Day of Month</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={form.schedule_day || ""}
                    onChange={(e) => setForm({ ...form, schedule_day: parseInt(e.target.value) })}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={form.schedule_time}
                onChange={(e) => setForm({ ...form, schedule_time: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Recipients (comma-separated emails)</Label>
              <Input
                placeholder="email1@example.com, email2@example.com"
                value={form.recipients}
                onChange={(e) => setForm({ ...form, recipients: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editingReport ? "Update" : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduledReports;
