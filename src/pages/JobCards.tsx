import { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Clock,
  User,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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

const jobCards: JobCard[] = [
  {
    id: "1",
    jobNumber: "JC-2024-0092",
    customer: "John Smith",
    phone: "+1 234 567 8901",
    device: "MacBook Pro 14\" M3",
    serialNumber: "C02X1234ABCD",
    issue: "Screen flickering and random shutdowns",
    status: "diagnosing",
    priority: "high",
    warranty: false,
    technician: "Mike Johnson",
    createdAt: "2024-01-28",
    dueDate: "2024-01-30",
    slaHours: 48,
  },
  {
    id: "2",
    jobNumber: "JC-2024-0091",
    customer: "Sarah Davis",
    phone: "+1 234 567 8902",
    device: "iPhone 15 Pro Max",
    serialNumber: "DNRX12345678",
    issue: "Battery draining quickly",
    status: "waiting_parts",
    priority: "normal",
    warranty: true,
    technician: "Alex Chen",
    createdAt: "2024-01-27",
    dueDate: "2024-01-31",
    slaHours: 72,
  },
  {
    id: "3",
    jobNumber: "JC-2024-0090",
    customer: "Michael Brown",
    phone: "+1 234 567 8903",
    device: "Samsung Galaxy S24 Ultra",
    serialNumber: "RF8N12345678",
    issue: "Cracked screen replacement",
    status: "repairing",
    priority: "urgent",
    warranty: false,
    technician: "Mike Johnson",
    createdAt: "2024-01-26",
    dueDate: "2024-01-28",
    slaHours: 24,
  },
  {
    id: "4",
    jobNumber: "JC-2024-0089",
    customer: "Emily Wilson",
    phone: "+1 234 567 8904",
    device: "iPad Pro 12.9\"",
    serialNumber: "DLXN12345678",
    issue: "Charging port not working",
    status: "testing",
    priority: "normal",
    warranty: false,
    technician: "Alex Chen",
    createdAt: "2024-01-25",
    dueDate: "2024-01-29",
    slaHours: 48,
  },
  {
    id: "5",
    jobNumber: "JC-2024-0088",
    customer: "David Lee",
    phone: "+1 234 567 8905",
    device: "iPhone 14 Pro",
    serialNumber: "DNRX87654321",
    issue: "Battery replacement",
    status: "completed",
    priority: "low",
    warranty: false,
    technician: "Mike Johnson",
    createdAt: "2024-01-24",
    dueDate: "2024-01-28",
    slaHours: 72,
  },
  {
    id: "6",
    jobNumber: "JC-2024-0093",
    customer: "Lisa Anderson",
    phone: "+1 234 567 8906",
    device: "MacBook Air M2",
    serialNumber: "C02Y5678EFGH",
    issue: "Keyboard keys not responding",
    status: "received",
    priority: "normal",
    warranty: true,
    createdAt: "2024-01-28",
    dueDate: "2024-02-01",
    slaHours: 72,
  },
];

const statusConfig = {
  received: { label: "Received", color: "bg-muted text-muted-foreground", icon: Clock },
  diagnosing: { label: "Diagnosing", color: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]", icon: Play },
  waiting_parts: { label: "Waiting Parts", color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]", icon: Pause },
  repairing: { label: "Repairing", color: "bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]", icon: Play },
  testing: { label: "Testing", color: "bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]", icon: Play },
  completed: { label: "Completed", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", icon: CheckCircle2 },
};

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]",
  high: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  urgent: "bg-destructive/10 text-destructive",
};

export default function JobCards() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredJobs = jobCards.filter(
    (job) =>
      (statusFilter === "all" || job.status === statusFilter) &&
      (job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusCount = (status: string) =>
    jobCards.filter((job) => job.status === status).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Cards</h1>
          <p className="text-muted-foreground">Manage repair and service jobs</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Job Card
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted">
            <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
              All ({jobCards.length})
            </TabsTrigger>
            <TabsTrigger value="received" onClick={() => setStatusFilter("received")}>
              Received ({getStatusCount("received")})
            </TabsTrigger>
            <TabsTrigger value="diagnosing" onClick={() => setStatusFilter("diagnosing")}>
              Diagnosing ({getStatusCount("diagnosing")})
            </TabsTrigger>
            <TabsTrigger value="waiting_parts" onClick={() => setStatusFilter("waiting_parts")}>
              Waiting Parts ({getStatusCount("waiting_parts")})
            </TabsTrigger>
            <TabsTrigger value="repairing" onClick={() => setStatusFilter("repairing")}>
              Repairing ({getStatusCount("repairing")})
            </TabsTrigger>
            <TabsTrigger value="completed" onClick={() => setStatusFilter("completed")}>
              Completed ({getStatusCount("completed")})
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Technician" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="mike">Mike Johnson</SelectItem>
                <SelectItem value="alex">Alex Chen</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Job Cards Grid */}
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => {
              const StatusIcon = statusConfig[job.status].icon;
              return (
                <div
                  key={job.id}
                  className="bg-card rounded-lg border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-card-foreground">{job.jobNumber}</span>
                        {job.warranty && (
                          <Badge variant="outline" className="text-xs bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30">
                            Warranty
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {job.createdAt}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Job
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Create Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Device & Issue */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-card-foreground">
                        {job.device}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      S/N: {job.serialNumber}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{job.issue}</p>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded-md">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{job.customer}</p>
                      <p className="text-xs text-muted-foreground">{job.phone}</p>
                    </div>
                  </div>

                  {/* Status & Priority */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={cn("gap-1", statusConfig[job.status].color)}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[job.status].label}
                    </Badge>
                    <Badge className={priorityColors[job.priority]}>
                      {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                    </Badge>
                  </div>

                  {/* Technician & SLA */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      {job.technician ? (
                        <>
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-xs text-primary-foreground">
                              {job.technician
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{job.technician}</span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Due: {job.dueDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
