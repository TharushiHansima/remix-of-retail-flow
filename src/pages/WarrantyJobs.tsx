import { useState } from "react";
import { Search, Filter, Shield, Clock, CheckCircle2, XCircle, AlertTriangle, MoreHorizontal, Eye, Edit, FileText, User, Smartphone, Calendar } from "lucide-react";
import { CreateWarrantyJobDialog } from "@/components/warranty/CreateWarrantyJobDialog";
import { ViewWarrantyJobDialog } from "@/components/warranty/ViewWarrantyJobDialog";
import { EditWarrantyJobDialog } from "@/components/warranty/EditWarrantyJobDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WarrantyJob {
  id: string; jobNumber: string; customer: string; phone: string; device: string; serialNumber: string; issue: string;
  status: "pending" | "in_progress" | "approved" | "rejected" | "completed"; warrantyType: "manufacturer" | "extended" | "store";
  warrantyExpiry: string; purchaseDate: string; claimStatus: "pending" | "submitted" | "approved" | "rejected";
  claimAmount?: number; createdAt: string; technician?: string;
}

const initialJobs: WarrantyJob[] = [
  { id: "1", jobNumber: "WJ-2024-0023", customer: "Sarah Davis", phone: "+1 234 567 8902", device: "iPhone 15 Pro Max", serialNumber: "DNRX12345678", issue: "Battery draining quickly - covered under warranty", status: "in_progress", warrantyType: "manufacturer", warrantyExpiry: "2025-06-15", purchaseDate: "2023-06-15", claimStatus: "approved", claimAmount: 89, createdAt: "2024-01-27", technician: "Alex Chen" },
  { id: "2", jobNumber: "WJ-2024-0022", customer: "Lisa Anderson", phone: "+1 234 567 8906", device: "MacBook Air M2", serialNumber: "C02Y5678EFGH", issue: "Keyboard keys not responding", status: "pending", warrantyType: "manufacturer", warrantyExpiry: "2025-03-20", purchaseDate: "2023-03-20", claimStatus: "pending", createdAt: "2024-01-28" },
  { id: "3", jobNumber: "WJ-2024-0021", customer: "James Wilson", phone: "+1 234 567 8908", device: "Samsung Galaxy S23", serialNumber: "RF8N87654321", issue: "Screen flickering issue", status: "completed", warrantyType: "extended", warrantyExpiry: "2025-08-10", purchaseDate: "2022-08-10", claimStatus: "approved", claimAmount: 180, createdAt: "2024-01-20", technician: "Mike Johnson" },
  { id: "4", jobNumber: "WJ-2024-0020", customer: "Emma Thompson", phone: "+1 234 567 8909", device: "iPad Air 5th Gen", serialNumber: "DLXN98765432", issue: "Touch screen not responding in certain areas", status: "rejected", warrantyType: "manufacturer", warrantyExpiry: "2024-01-15", purchaseDate: "2023-01-15", claimStatus: "rejected", createdAt: "2024-01-18" },
  { id: "5", jobNumber: "WJ-2024-0024", customer: "Robert Martinez", phone: "+1 234 567 8910", device: "Dell XPS 13", serialNumber: "SVC12345678", issue: "Fan making loud noise", status: "in_progress", warrantyType: "store", warrantyExpiry: "2024-12-01", purchaseDate: "2023-12-01", claimStatus: "submitted", createdAt: "2024-01-29", technician: "Alex Chen" },
];

const statusConfig = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]", icon: Clock },
  approved: { label: "Approved", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: XCircle },
  completed: { label: "Completed", color: "bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]", icon: CheckCircle2 },
};

const claimStatusConfig = { pending: { label: "Pending", color: "bg-muted text-muted-foreground" }, submitted: { label: "Submitted", color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]" }, approved: { label: "Approved", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" }, rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive" } };
const warrantyTypeConfig = { manufacturer: { label: "Manufacturer", color: "bg-[hsl(var(--chart-1))]/10 text-[hsl(var(--chart-1))]" }, extended: { label: "Extended", color: "bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]" }, store: { label: "Store", color: "bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]" } };

export default function WarrantyJobs() {
  const [jobs, setJobs] = useState<WarrantyJob[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<WarrantyJob | null>(null);

  const filteredJobs = jobs.filter((job) => (statusFilter === "all" || job.status === statusFilter) && (job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) || job.customer.toLowerCase().includes(searchQuery.toLowerCase()) || job.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())));
  const getStatusCount = (status: string) => jobs.filter((j) => j.status === status).length;
  const activeWarrantyJobs = jobs.filter((j) => j.status === "in_progress" || j.status === "pending").length;
  const approvedClaims = jobs.filter((j) => j.claimStatus === "approved").length;
  const totalClaimValue = jobs.filter((j) => j.claimStatus === "approved" && j.claimAmount).reduce((sum, j) => sum + (j.claimAmount || 0), 0);

  const handleView = (job: WarrantyJob) => { setSelectedJob(job); setViewDialogOpen(true); };
  const handleEdit = (job: WarrantyJob) => { setSelectedJob(job); setEditDialogOpen(true); };
  const handleSaveEdit = (updated: WarrantyJob) => { setJobs(jobs.map((j) => (j.id === updated.id ? updated : j))); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Warranty Jobs</h1><p className="text-muted-foreground">Manage warranty repairs and claims</p></div>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}><Shield className="h-4 w-4 mr-2" />New Warranty Job</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Warranty Jobs</CardTitle><Clock className="h-4 w-4 text-[hsl(var(--info))]" /></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">{activeWarrantyJobs}</div><p className="text-xs text-muted-foreground">In progress or pending</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Approved Claims</CardTitle><CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" /></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">{approvedClaims}</div><p className="text-xs text-muted-foreground">This month</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Claim Value</CardTitle><Shield className="h-4 w-4 text-[hsl(var(--chart-3))]" /></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">${totalClaimValue.toFixed(2)}</div><p className="text-xs text-muted-foreground">Approved claims value</p></CardContent></Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted">
            <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>All ({jobs.length})</TabsTrigger>
            <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>Pending ({getStatusCount("pending")})</TabsTrigger>
            <TabsTrigger value="in_progress" onClick={() => setStatusFilter("in_progress")}>In Progress ({getStatusCount("in_progress")})</TabsTrigger>
            <TabsTrigger value="completed" onClick={() => setStatusFilter("completed")}>Completed ({getStatusCount("completed")})</TabsTrigger>
            <TabsTrigger value="rejected" onClick={() => setStatusFilter("rejected")}>Rejected ({getStatusCount("rejected")})</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-3"><div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search warranty jobs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div><Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button></div>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader><TableRow><TableHead>Job #</TableHead><TableHead>Customer</TableHead><TableHead>Device</TableHead><TableHead>Warranty Type</TableHead><TableHead>Warranty Expiry</TableHead><TableHead>Claim Status</TableHead><TableHead>Job Status</TableHead><TableHead>Technician</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredJobs.map((job) => {
                  const StatusIcon = statusConfig[job.status].icon;
                  const isExpired = new Date(job.warrantyExpiry) < new Date();
                  return (
                    <TableRow key={job.id}>
                      <TableCell><div><span className="font-medium text-foreground">{job.jobNumber}</span><p className="text-xs text-muted-foreground">{job.createdAt}</p></div></TableCell>
                      <TableCell><div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium text-foreground">{job.customer}</p><p className="text-xs text-muted-foreground">{job.phone}</p></div></div></TableCell>
                      <TableCell><div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm text-foreground">{job.device}</p><p className="text-xs text-muted-foreground font-mono">{job.serialNumber}</p></div></div></TableCell>
                      <TableCell><Badge className={warrantyTypeConfig[job.warrantyType].color}>{warrantyTypeConfig[job.warrantyType].label}</Badge></TableCell>
                      <TableCell><div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-muted-foreground" /><span className={cn("text-sm", isExpired ? "text-destructive" : "text-foreground")}>{job.warrantyExpiry}</span>{isExpired && <AlertTriangle className="h-3 w-3 text-destructive" />}</div></TableCell>
                      <TableCell><Badge className={claimStatusConfig[job.claimStatus].color}>{claimStatusConfig[job.claimStatus].label}</Badge></TableCell>
                      <TableCell><Badge className={cn("gap-1", statusConfig[job.status].color)}><StatusIcon className="h-3 w-3" />{statusConfig[job.status].label}</Badge></TableCell>
                      <TableCell>{job.technician ? <span className="text-sm text-foreground">{job.technician}</span> : <span className="text-sm text-muted-foreground italic">Unassigned</span>}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem onClick={() => handleView(job)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(job)}><Edit className="mr-2 h-4 w-4" />Edit Job</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <CreateWarrantyJobDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ViewWarrantyJobDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} job={selectedJob} />
      <EditWarrantyJobDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} job={selectedJob} onSave={handleSaveEdit} />
    </div>
  );
}
