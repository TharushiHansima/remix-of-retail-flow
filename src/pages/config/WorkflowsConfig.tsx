import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfig } from "@/contexts/ConfigContext";
import { WorkflowStepper } from "@/components/workflow/WorkflowStepper";
import { ArrowRight, Plus, Edit2 } from "lucide-react";
import type { WorkflowDefinition, WorkflowStatus } from "@/config/types";

export default function WorkflowsConfig() {
  const { config, updateConfig } = useConfig();
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);

  const handleStatusColorChange = (workflowId: string, statusId: string, color: string) => {
    const updatedWorkflows = config.workflows.map(w => {
      if (w.id !== workflowId) return w;
      return {
        ...w,
        statuses: w.statuses.map(s => 
          s.id === statusId ? { ...s, color } : s
        )
      };
    });
    updateConfig({ workflows: updatedWorkflows });
  };

  const colorOptions = [
    { value: 'bg-muted', label: 'Gray' },
    { value: 'bg-blue-500', label: 'Blue' },
    { value: 'bg-green-500', label: 'Green' },
    { value: 'bg-yellow-500', label: 'Yellow' },
    { value: 'bg-orange-500', label: 'Orange' },
    { value: 'bg-red-500', label: 'Red' },
    { value: 'bg-purple-500', label: 'Purple' },
    { value: 'bg-primary', label: 'Primary' },
    { value: 'bg-destructive', label: 'Destructive' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Workflow Configuration</h1>
        <p className="text-muted-foreground">Define status flows and transitions for your documents</p>
      </div>

      <div className="grid gap-6">
        {config.workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{workflow.name}</CardTitle>
                  <CardDescription>Entity: {workflow.entityType}</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedWorkflow(workflow)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit {workflow.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Statuses</Label>
                        <div className="mt-2 space-y-2">
                          {workflow.statuses.map(status => (
                            <div key={status.id} className="flex items-center gap-3 p-2 rounded border">
                              <div className={`w-4 h-4 rounded ${status.color}`} />
                              <span className="flex-1">{status.name}</span>
                              <select
                                className="text-sm border rounded px-2 py-1"
                                value={status.color}
                                onChange={(e) => handleStatusColorChange(workflow.id, status.id, e.target.value)}
                              >
                                {colorOptions.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Flow Preview */}
              <div>
                <Label className="text-sm text-muted-foreground">Status Flow</Label>
                <div className="mt-2">
                  <WorkflowStepper 
                    workflow={workflow} 
                    currentStatus={workflow.statuses[0]?.id || ''} 
                    showAll 
                  />
                </div>
              </div>

              {/* Transitions */}
              <div>
                <Label className="text-sm text-muted-foreground">Transitions</Label>
                <div className="mt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {workflow.transitions.map((transition, idx) => {
                    const fromStatus = workflow.statuses.find(s => s.id === transition.from);
                    const toStatus = workflow.statuses.find(s => s.id === transition.to);
                    
                    return (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded border text-sm">
                        <Badge variant="outline" className="text-xs">{fromStatus?.name}</Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">{toStatus?.name}</Badge>
                        {transition.requiredRoles && (
                          <Badge variant="secondary" className="text-xs ml-auto">
                            {transition.requiredRoles.join(', ')}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
