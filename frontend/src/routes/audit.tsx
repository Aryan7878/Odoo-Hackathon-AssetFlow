import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ClipboardCheck, Building2, CheckCircle2, Clock, ArrowLeft, ShieldAlert } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Audit · AssetPlanet" }, { name: "description", content: "Track department audit progress in real time." }] }),
  component: AuditPage,
});

function AuditPage() {
  const queryClient = useQueryClient();
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Queries
  const cyclesQuery = useQuery({
    queryKey: ["auditCycles"],
    queryFn: () => apiClient.getAuditCycles(),
  });

  const activeCycleQuery = useQuery({
    queryKey: ["auditCycle", activeCycleId],
    queryFn: () => apiClient.getAuditCycleById(activeCycleId!),
    enabled: !!activeCycleId,
  });

  // Verify item mutation
  const verifyMutation = useMutation({
    mutationFn: ({ cycleId, itemId, status, notes }: { cycleId: string; itemId: string; status: string; notes?: string }) =>
      apiClient.verifyAuditItem(cycleId, itemId, status, notes),
    onSuccess: () => {
      toast.success("Asset status verified");
      queryClient.invalidateQueries({ queryKey: ["auditCycle", activeCycleId] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to verify asset");
    },
  });

  // Complete cycle mutation
  const completeMutation = useMutation({
    mutationFn: (id: string) => apiClient.completeAuditCycle(id),
    onSuccess: () => {
      toast.success("Audit cycle completed successfully");
      queryClient.invalidateQueries({ queryKey: ["auditCycles"] });
      queryClient.invalidateQueries({ queryKey: ["auditCycle", activeCycleId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to complete audit");
    },
  });

  const cycles = cyclesQuery.data || [];
  const activeCycle = activeCycleQuery.data;

  const formatDate = (val: any) => {
    if (!val) return "—";
    return new Date(val).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusLabel = (stat: string) => {
    switch (stat) {
      case "PENDING": return "Pending";
      case "VERIFIED": return "Verified";
      case "MISSING": return "Missing";
      case "DAMAGED": return "Damaged";
      default: return stat;
    }
  };

  if (activeCycleId && activeCycle) {
    const items = activeCycle.auditItems || [];
    const verified = items.filter((i: any) => i.status !== "PENDING").length;
    const total = items.length;
    const progress = total > 0 ? Math.round((verified / total) * 100) : 0;
    
    return (
      <AppShell
        title={activeCycle.title}
        description={activeCycle.description || "Physical asset verification list."}
        breadcrumbs={[{ label: "AssetPlanet", to: "/" }, { label: "Audit" }, { label: activeCycle.title }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl h-9" onClick={() => setActiveCycleId(null)}>
              <ArrowLeft className="h-4 w-4" /> Back to rounds
            </Button>
            {!activeCycle.isCompleted && (
              <Button
                size="sm"
                className="rounded-xl h-9"
                onClick={() => completeMutation.mutate(activeCycle.id)}
                disabled={completeMutation.isPending}
              >
                Complete cycle
              </Button>
            )}
          </div>
        }
      >
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <div className="flex flex-wrap items-center gap-6 justify-between">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wide text-primary">Verification Round Progress</div>
              <h2 className="mt-1 text-[22px] font-semibold tracking-tight">{progress}% Completed</h2>
              <p className="text-[13px] text-muted-foreground">{verified} of {total} assets verified.</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-[20px] font-semibold text-success">{items.filter((i: any) => i.status === "VERIFIED").length}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-[20px] font-semibold text-destructive">{items.filter((i: any) => i.status === "MISSING").length}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Missing</div>
              </div>
              <div className="text-center">
                <div className="text-[20px] font-semibold text-warning-foreground">{items.filter((i: any) => i.status === "DAMAGED").length}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Damaged</div>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {items.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No assets in this audit cycle.</div>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr className="text-left">
                  <th className="py-3 px-4 font-medium">Asset Tag</th>
                  <th className="py-3 px-2 font-medium">Asset Name</th>
                  <th className="py-3 px-2 font-medium">Listed Condition</th>
                  <th className="py-3 px-2 font-medium">Verification Status</th>
                  <th className="py-3 px-2 font-medium">Notes</th>
                  {!activeCycle.isCompleted && <th className="py-3 px-4 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((i: any) => (
                  <tr key={i.id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-mono text-[11.5px] font-medium text-primary">{i.asset?.assetTag}</td>
                    <td className="py-3 px-2 font-medium text-foreground">{i.asset?.name}</td>
                    <td className="py-3 px-2 text-muted-foreground">{i.asset?.condition}</td>
                    <td className="py-3 px-2"><StatusBadge status={getStatusLabel(i.status)} /></td>
                    <td className="py-3 px-2 text-muted-foreground max-w-xs truncate">{i.notes || "—"}</td>
                    {!activeCycle.isCompleted && (
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg text-[12px] text-success hover:bg-success/5 border-success/20"
                            onClick={() => verifyMutation.mutate({ cycleId: activeCycle.id, itemId: i.id, status: "VERIFIED" })}
                          >
                            Verify
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg text-[12px] text-destructive hover:bg-destructive/5 border-destructive/20"
                            onClick={() => verifyMutation.mutate({ cycleId: activeCycle.id, itemId: i.id, status: "MISSING", notes: "Asset not found at listed location." })}
                          >
                            Missing
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg text-[12px] text-warning-foreground hover:bg-warning/5 border-warning/20"
                            onClick={() => verifyMutation.mutate({ cycleId: activeCycle.id, itemId: i.id, status: "DAMAGED", notes: "Asset damaged, needs repair." })}
                          >
                            Damaged
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Audit"
      description="Real-time visibility into physical asset verification across departments."
      breadcrumbs={[{ label: "AssetPlanet", to: "/" }, { label: "Audit" }]}
      actions={<Button size="sm" className="rounded-xl h-9" onClick={() => setOpen(true)}><ClipboardCheck className="h-4 w-4" /> Start audit round</Button>}
    >
      {cyclesQuery.isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : cycles.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">No audit rounds created yet. Click "Start audit round" to begin.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cycles.map((c: any) => {
            const isCompleted = c.isCompleted;
            const itemsCount = c._count?.auditItems || 0;
            
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-5 card-hover cursor-pointer" onClick={() => setActiveCycleId(c.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[15px] font-semibold">{c.title}</div>
                      <div className="text-[12px] text-muted-foreground">{itemsCount} assets in audit</div>
                    </div>
                  </div>
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-success/12 rounded-md px-2 py-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-warning-foreground bg-warning/15 rounded-md px-2 py-1">
                      <Clock className="h-3.5 w-3.5" /> In progress
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-1.5 text-[12.5px] text-muted-foreground">
                  <div className="flex justify-between border-b pb-1.5">
                    <span>Scope</span>
                    <span className="font-medium text-foreground">{c.department?.name || "Global Workspace"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Started</span>
                    <span className="font-medium text-foreground">{formatDate(c.startDate)}</span>
                  </div>
                </div>

                <Button variant="ghost" size="sm" className="mt-4 w-full rounded-xl border border-border">View assets checklist →</Button>
              </div>
            );
          })}
        </div>
      )}

      <StartAuditDialog open={open} onOpenChange={setOpen} />
    </AppShell>
  );
}

function StartAuditDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiClient.getDepartments(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; departmentId: string }) => {
      // 1. Fetch assets for this department to seed the audit items
      const assets = await apiClient.getAssets({ departmentId: data.departmentId, limit: 100 });
      const assetIds = assets.data.map((a: any) => a.id);
      
      if (assetIds.length === 0) {
        throw new Error("No assets found in the selected department to audit");
      }

      // 2. Create the audit cycle with asset IDs
      return apiClient.createAuditCycle({
        title: data.title,
        description: data.description,
        departmentId: data.departmentId,
        startDate: new Date().toISOString(),
        assetIds,
      });
    },
    onSuccess: () => {
      toast.success("Audit round started successfully");
      queryClient.invalidateQueries({ queryKey: ["auditCycles"] });
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setDepartmentId("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to start audit round");
    },
  });

  const depts = departmentsQuery.data || [];

  const handleStart = () => {
    if (!title || !departmentId) {
      toast.error("Please specify a title and select a department");
      return;
    }
    createMutation.mutate({ title, description, departmentId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start physical audit round</DialogTitle>
          <DialogDescription>Create a verification checklist for all assets in a department.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Audit Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q3 2026 Engineering Audit" />
          </div>
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Scope Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {depts.map((d: any) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Description / Instructions</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide instructions for verification officers…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleStart} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Starting round..." : "Start round"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
