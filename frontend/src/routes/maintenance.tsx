import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Wrench, User, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance · AssetPlanet" }, { name: "description", content: "Kanban board of open maintenance requests." }] }),
  component: MaintenancePage,
});

const columns = [
  { status: "PENDING", label: "Pending", tone: "bg-muted-foreground/40" },
  { status: "APPROVED", label: "Approved", tone: "bg-primary" },
  { status: "IN_PROGRESS", label: "In Progress", tone: "bg-warning" },
  { status: "COMPLETED", label: "Resolved", tone: "bg-success" },
] as const;

function MaintenancePage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [actionRequest, setActionRequest] = useState<any | null>(null);

  // Resolution inputs for completion modal
  const [resolution, setResolution] = useState("");
  const [cost, setCost] = useState("");

  const maintenanceQuery = useQuery({
    queryKey: ["maintenance", "all"],
    queryFn: () => apiClient.getMaintenanceRequests(),
  });

  // Action Mutations
  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.approveMaintenance(id, {}),
    onSuccess: () => {
      toast.success("Request approved");
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      setActionRequest(null);
    },
    onError: (err: any) => toast.error(err.message || "Approval failed"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.rejectMaintenance(id, "Rejected by administrator"),
    onSuccess: () => {
      toast.success("Request rejected");
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      setActionRequest(null);
    },
    onError: (err: any) => toast.error(err.message || "Rejection failed"),
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => apiClient.startMaintenance(id),
    onSuccess: () => {
      toast.success("Maintenance started");
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setActionRequest(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to start maintenance"),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, res, costVal }: { id: string; res: string; costVal?: number }) =>
      apiClient.completeMaintenance(id, { resolution: res, cost: costVal }),
    onSuccess: () => {
      toast.success("Maintenance completed");
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      setActionRequest(null);
      setResolution("");
      setCost("");
    },
    onError: (err: any) => toast.error(err.message || "Failed to complete maintenance"),
  });

  const maintenanceData = maintenanceQuery.data || [];

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "LOW": return "Low";
      case "MEDIUM": return "Medium";
      case "HIGH": return "High";
      case "CRITICAL": return "Critical";
      default: return priority;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const timeDiff = Math.max(1, Math.round((Date.now() - new Date(dateStr).getTime()) / 60000));
    if (timeDiff < 60) return `${timeDiff}m ago`;
    if (timeDiff < 1440) return `${Math.floor(timeDiff / 60)}h ago`;
    return `${Math.floor(timeDiff / 1440)}d ago`;
  };

  return (
    <AppShell
      title="Maintenance"
      description="Kanban board of open service and repair requests across all assets."
      breadcrumbs={[{ label: "AssetPlanet", to: "/" }, { label: "Maintenance" }]}
      actions={<Button size="sm" className="rounded-xl h-9" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Raise request</Button>}
    >
      {maintenanceQuery.isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((c) => {
            const items = maintenanceData.filter((m: any) => m.status === c.status);
            return (
              <div key={c.status} className="rounded-2xl bg-muted/40 border border-border p-3">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className={`h-2 w-2 rounded-full ${c.tone}`} />
                  <h3 className="text-[13px] font-semibold text-foreground">{c.label}</h3>
                  <span className="ml-auto text-[11px] font-semibold text-muted-foreground bg-background rounded-md px-1.5 py-0.5">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {items.map((m: any) => (
                    <div
                      key={m.id}
                      className="rounded-xl bg-card border border-border p-3.5 card-hover cursor-pointer"
                      onClick={() => setActionRequest(m)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-warning/15 text-warning-foreground grid place-items-center shrink-0">
                          <Wrench className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-semibold truncate">{m.asset?.name}</div>
                          <div className="font-mono text-[10.5px] text-primary">{m.asset?.assetTag}</div>
                        </div>
                      </div>
                      <p className="mt-2.5 text-[12px] text-muted-foreground line-clamp-2 leading-snug">{m.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <StatusBadge status={getPriorityLabel(m.priority)} />
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <User className="h-3 w-3" /> {m.requestedBy?.firstName || "Staff"}
                        </div>
                      </div>
                      <div className="mt-2 text-[10.5px] text-muted-foreground">Updated {formatRelativeTime(m.updatedAt)}</div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center text-[12px] text-muted-foreground">
                      Nothing here yet
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Sheet Modal */}
      <Dialog open={!!actionRequest} onOpenChange={(v) => !v && setActionRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Request</DialogTitle>
            <DialogDescription>Take actions on this maintenance ticket.</DialogDescription>
          </DialogHeader>
          {actionRequest && (
            <div className="space-y-4 py-2 text-sm">
              <div>
                <div className="font-semibold text-foreground">{actionRequest.asset?.name}</div>
                <div className="text-xs text-muted-foreground">{actionRequest.asset?.assetTag}</div>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 border border-border">
                <div className="font-medium">Description</div>
                <p className="text-xs text-muted-foreground mt-1">{actionRequest.description}</p>
              </div>
              
              {actionRequest.status === "PENDING" && (
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5" onClick={() => rejectMutation.mutate(actionRequest.id)}>Reject</Button>
                  <Button onClick={() => approveMutation.mutate(actionRequest.id)}>Approve Request</Button>
                </div>
              )}
              
              {actionRequest.status === "APPROVED" && (
                <div className="flex gap-2 justify-end">
                  <Button className="w-full" onClick={() => startMutation.mutate(actionRequest.id)}>Start Repair Work</Button>
                </div>
              )}

              {actionRequest.status === "IN_PROGRESS" && (
                <div className="space-y-3 pt-2">
                  <div>
                    <Label className="text-[12.5px] mb-1 block">Resolution Report</Label>
                    <Textarea value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="What was done to resolve the issue?" />
                  </div>
                  <div>
                    <Label className="text-[12.5px] mb-1 block">Cost ($)</Label>
                    <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
                  </div>
                  <Button className="w-full" onClick={() => {
                    if (!resolution) {
                      toast.error("Please add a resolution description");
                      return;
                    }
                    completeMutation.mutate({
                      id: actionRequest.id,
                      res: resolution,
                      costVal: cost ? parseFloat(cost) : undefined
                    });
                  }}>Complete Maintenance</Button>
                </div>
              )}

              {actionRequest.status === "COMPLETED" && (
                <div className="space-y-2">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Resolution</span>
                    <span className="font-medium">{actionRequest.resolution || "Completed"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Repair Cost</span>
                    <span className="font-semibold text-foreground">${parseFloat(actionRequest.cost || "0").toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RaiseRequestDialog open={open} onOpenChange={setOpen} />
    </AppShell>
  );
}

function RaiseRequestDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const [assetId, setAssetId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  const assetsQuery = useQuery({
    queryKey: ["assets", "all-list"],
    queryFn: () => apiClient.getAssets({ limit: 100 }),
  });

  const raiseMutation = useMutation({
    mutationFn: (data: any) => apiClient.createMaintenanceRequest(data),
    onSuccess: () => {
      toast.success("Maintenance request submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      onOpenChange(false);
      setAssetId("");
      setTitle("");
      setDescription("");
    },
    onError: (err: any) => toast.error(err.message || "Submission failed"),
  });

  const assetsList = assetsQuery.data?.data || [];

  const handleRaise = () => {
    if (!assetId || !title || !description) {
      toast.error("Please fill in all fields");
      return;
    }

    raiseMutation.mutate({
      assetId,
      title,
      description,
      priority,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Raise a service request</DialogTitle>
          <DialogDescription>Submit a maintenance ticket for an asset.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Asset</Label>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
              <SelectContent>
                {assetsList.map((a: any) => (
                  <SelectItem key={a.id} value={a.id}>{a.assetTag} · {a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Issue Summary</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Keyboard keys unresponsive" />
          </div>
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Detailed Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Explain the symptoms in detail…" />
          </div>
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleRaise} disabled={raiseMutation.isPending}>
            {raiseMutation.isPending ? "Submitting..." : "Submit request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
