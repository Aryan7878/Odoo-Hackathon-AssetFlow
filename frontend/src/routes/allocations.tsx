import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus, ArrowLeftRight, RotateCcw, PackageCheck, Clock, TriangleAlert,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/allocations")({
  head: () => ({ meta: [{ title: "Allocations · AssetFlow" }, { name: "description", content: "Manage active allocations, transfers and returns." }] }),
  component: AllocationsPage,
});

function AllocationsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Queries
  const statsQuery = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => apiClient.getDashboardStats(),
  });

  const allocationsQuery = useQuery({
    queryKey: ["allocations", "all"],
    queryFn: () => apiClient.getAllocations({ limit: 100, status: "ACTIVE" }),
  });

  // Return mutation
  const returnMutation = useMutation({
    mutationFn: (id: string) => apiClient.returnAllocation(id, "Returned by employee."),
    onSuccess: () => {
      toast.success("Asset returned successfully");
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to return asset");
    },
  });

  const allocationsData = allocationsQuery.data?.data || [];

  const formatDate = (val: any) => {
    if (!val) return "—";
    return new Date(val).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <AppShell
      title="Allocations"
      description="Track who has what, when it's due back, and where things stand."
      breadcrumbs={[{ label: "AssetFlow", to: "/" }, { label: "Allocations" }]}
      actions={<Button size="sm" className="rounded-xl h-9" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New allocation</Button>}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Allocations" value={statsQuery.data?.allocatedAssets?.toLocaleString() || "0"} icon={<PackageCheck className="h-5 w-5" />} tone="info" />
        <StatCard label="Due Soon" value={statsQuery.data?.upcomingReturns?.toLocaleString() || "0"} icon={<Clock className="h-5 w-5" />} tone="warning" />
        <StatCard label="Overdue" value={statsQuery.data?.overdueAssets?.toLocaleString() || "0"} icon={<TriangleAlert className="h-5 w-5" />} tone="danger" />
        <StatCard label="Total Assets" value={statsQuery.data?.totalAssets?.toLocaleString() || "0"} icon={<RotateCcw className="h-5 w-5" />} tone="success" />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-[15px] font-semibold">Active allocations</h3>
            <p className="text-[12.5px] text-muted-foreground">List of assets currently issued to employees</p>
          </div>
        </div>

        {allocationsQuery.isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading allocations...</span>
            </div>
          </div>
        ) : allocationsData.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <PackageCheck className="h-8 w-8 text-muted-foreground/50" />
            <div className="font-semibold text-foreground">No active allocations</div>
            <div className="text-sm text-muted-foreground">All assets are currently in inventory.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr className="text-left">
                  <th className="py-3 px-4 font-medium">Asset</th>
                  <th className="py-3 px-2 font-medium">Employee</th>
                  <th className="py-3 px-2 font-medium">Department</th>
                  <th className="py-3 px-2 font-medium">Allocated</th>
                  <th className="py-3 px-2 font-medium">Expected Return</th>
                  <th className="py-3 px-2 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allocationsData.map((a: any) => {
                  const empName = a.allocatedTo ? `${a.allocatedTo.firstName} ${a.allocatedTo.lastName}` : "—";
                  
                  return (
                    <tr key={a.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">{a.asset?.name}</div>
                        <div className="font-mono text-[11px] text-primary">{a.asset?.assetTag}</div>
                      </td>
                      <td className="py-3 px-2 text-foreground">{empName}</td>
                      <td className="py-3 px-2 text-muted-foreground">{a.allocatedTo?.department?.name || "—"}</td>
                      <td className="py-3 px-2 text-muted-foreground">{formatDate(a.allocationDate)}</td>
                      <td className="py-3 px-2 text-muted-foreground">{formatDate(a.expectedReturn)}</td>
                      <td className="py-3 px-2">
                        <StatusBadge status={a.status === "ACTIVE" ? "Active" : "Returned"} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg text-[12px]"
                            onClick={() => returnMutation.mutate(a.id)}
                            disabled={returnMutation.isPending}
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Return
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AllocateDialog open={open} onOpenChange={setOpen} />
    </AppShell>
  );
}

function AllocateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const [assetId, setAssetId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [notes, setNotes] = useState("");

  // Queries
  const availableAssetsQuery = useQuery({
    queryKey: ["assets", "available"],
    queryFn: () => apiClient.getAssets({ limit: 100, status: "AVAILABLE" }),
  });

  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: () => apiClient.getEmployees({ limit: 100 }),
  });

  // Mutation
  const allocateMutation = useMutation({
    mutationFn: (data: any) => apiClient.createAllocation(data),
    onSuccess: () => {
      toast.success("Asset allocated successfully");
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      onOpenChange(false);
      // Reset
      setAssetId("");
      setEmployeeId("");
      setExpectedReturn("");
      setNotes("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to allocate asset");
    },
  });

  const availableAssets = availableAssetsQuery.data?.data || [];
  const employeesList = employeesQuery.data?.data || [];

  const handleAllocate = () => {
    if (!assetId || !employeeId) {
      toast.error("Please select an asset and an employee");
      return;
    }

    allocateMutation.mutate({
      assetId,
      allocatedToId: employeeId,
      expectedReturn: expectedReturn ? new Date(expectedReturn).toISOString() : null,
      notes: notes || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            Allocate asset
          </DialogTitle>
          <DialogDescription>Assign an available asset to an employee.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Asset</Label>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger><SelectValue placeholder="Select an available asset" /></SelectTrigger>
              <SelectContent>
                {availableAssets.map((a: any) => (
                  <SelectItem key={a.id} value={a.id}>{a.assetTag} · {a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Employee</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {employeesList.map((e: any) => (
                  <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName} · {e.department?.name || "Corporate"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[12.5px] mb-1.5 block">Allocated date</Label>
              <Input type="date" disabled defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <Label className="text-[12.5px] mb-1.5 block">Expected return</Label>
              <Input type="date" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Purpose, project code, etc." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAllocate} disabled={allocateMutation.isPending}>
            {allocateMutation.isPending ? "Allocating..." : "Allocate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
