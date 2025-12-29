import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useConfig } from "@/contexts/ConfigContext";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, ShieldCheck } from "lucide-react";
import type { ApprovalRule } from "@/config/types";

export default function ApprovalsConfig() {
  const { config, updateConfig } = useConfig();
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleRule = (ruleId: string) => {
    const updatedRules = config.approvalRules.map(r =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    );
    updateConfig({ approvalRules: updatedRules });
  };

  const deleteRule = (ruleId: string) => {
    const updatedRules = config.approvalRules.filter(r => r.id !== ruleId);
    updateConfig({ approvalRules: updatedRules });
    toast.success("Rule deleted");
  };

  const saveRule = () => {
    if (!editingRule) return;
    
    const exists = config.approvalRules.find(r => r.id === editingRule.id);
    let updatedRules: ApprovalRule[];
    
    if (exists) {
      updatedRules = config.approvalRules.map(r =>
        r.id === editingRule.id ? editingRule : r
      );
    } else {
      updatedRules = [...config.approvalRules, editingRule];
    }
    
    updateConfig({ approvalRules: updatedRules });
    setIsDialogOpen(false);
    setEditingRule(null);
    toast.success("Rule saved");
  };

  const createNewRule = () => {
    setEditingRule({
      id: `rule_${Date.now()}`,
      name: '',
      description: '',
      entityType: 'invoice',
      condition: { field: '', operator: 'gt', value: 0 },
      approverRoles: ['admin', 'manager'],
      enabled: true,
    });
    setIsDialogOpen(true);
  };

  const entityTypes = ['invoice', 'purchase_order', 'stock_adjustment', 'job_card', 'grn'];
  const operators = [
    { value: 'gt', label: 'Greater than' },
    { value: 'lt', label: 'Less than' },
    { value: 'eq', label: 'Equal to' },
    { value: 'gte', label: 'Greater or equal' },
    { value: 'lte', label: 'Less or equal' },
  ];
  const availableRoles = ['admin', 'manager', 'cashier', 'technician'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Approval Rules</h1>
          <p className="text-muted-foreground">Configure approval workflows for business processes</p>
        </div>
        <Button onClick={createNewRule}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="grid gap-4">
        {config.approvalRules.map((rule) => (
          <Card key={rule.id} className={!rule.enabled ? "opacity-60" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className={`h-5 w-5 ${rule.enabled ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <CardTitle className="text-base">{rule.name}</CardTitle>
                    <CardDescription>{rule.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setEditingRule(rule);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="outline">{rule.entityType}</Badge>
                <Badge variant="secondary">
                  {rule.condition.field} {rule.condition.operator} {String(rule.condition.value)}
                </Badge>
                <Badge variant="default" className="ml-auto">
                  Approvers: {rule.approverRoles.join(', ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRule?.id.startsWith('rule_') ? 'Create' : 'Edit'} Approval Rule</DialogTitle>
          </DialogHeader>
          {editingRule && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  placeholder="e.g., High Discount Approval"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  placeholder="Describe when this rule applies"
                />
              </div>
              <div className="space-y-2">
                <Label>Entity Type</Label>
                <Select
                  value={editingRule.entityType}
                  onValueChange={(value) => setEditingRule({ ...editingRule, entityType: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {entityTypes.map(type => (
                      <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Field name"
                    value={editingRule.condition.field}
                    onChange={(e) => setEditingRule({
                      ...editingRule,
                      condition: { ...editingRule.condition, field: e.target.value }
                    })}
                    className="flex-1"
                  />
                  <Select
                    value={editingRule.condition.operator}
                    onValueChange={(value: any) => setEditingRule({
                      ...editingRule,
                      condition: { ...editingRule.condition, operator: value }
                    })}
                  >
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {operators.map(op => (
                        <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Value"
                    value={String(editingRule.condition.value)}
                    onChange={(e) => setEditingRule({
                      ...editingRule,
                      condition: { 
                        ...editingRule.condition, 
                        value: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value) 
                      }
                    })}
                    className="w-[100px]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Approver Roles</Label>
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map(role => (
                    <Badge
                      key={role}
                      variant={editingRule.approverRoles.includes(role) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const roles = editingRule.approverRoles.includes(role)
                          ? editingRule.approverRoles.filter(r => r !== role)
                          : [...editingRule.approverRoles, role];
                        setEditingRule({ ...editingRule, approverRoles: roles });
                      }}
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveRule}>Save Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
