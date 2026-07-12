import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Plus, Building2, Users, Boxes, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/departments")({
  head: () => ({ meta: [{ title: "Departments · AssetPlanet" }, { name: "description", content: "Manage departments and their asset allocations." }] }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiClient.getDepartments(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteDepartment(id),
    onSuccess: () => {
      toast.success("Department deleted");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setDeleteTarget(null);
    },
    onError: (err: any) => toast.error(err.message || "Delete failed"),
  });

  const departments = departmentsQuery.data || [];

  return (
    <AppShell
      title="Departments"
      description="Team-level view of asset ownership, headcount and utilization."
      breadcrumbs={[{ label: "AssetPlanet", to: "/" }, { label: "Departments" }]}
      actions={<Button size="sm" className="rounded-xl h-9" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Add department</Button>}
    >
      {departmentsQuery.isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : departments.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">No departments registered.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.map((d: any) => {
            const assetsCount = d._count?.assets || 0;
            const membersCount = d._count?.users || 0;
            const utilization = membersCount > 0 ? Math.min(100, Math.round((assetsCount / (membersCount * 2)) * 100)) : 0;

            return (
              <div key={d.id} className="rounded-2xl border border-border bg-card p-5 card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[15px] font-semibold text-foreground">{d.name}</div>
                      <div className="text-[12px] text-muted-foreground">Code: {d.code}</div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/50 transition">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditTarget(d)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(d)}>
                        <Trash className="h-3.5 w-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wide"><Boxes className="h-3 w-3" /> Assets</div>
                    <div className="mt-0.5 text-[20px] font-semibold tabular-nums">{assetsCount}</div>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wide"><Users className="h-3 w-3" /> Members</div>
                    <div className="mt-0.5 text-[20px] font-semibold tabular-nums">{membersCount}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[12px] text-muted-foreground mb-1.5">
                    <span>Asset utilization</span>
                    <span className="font-semibold text-foreground">{utilization}%</span>
                  </div>
                  <Progress value={utilization} className="h-1.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <DepartmentDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Edit Dialog */}
      {editTarget && (
        <DepartmentDialog
          open={!!editTarget}
          onOpenChange={(v) => !v && setEditTarget(null)}
          department={editTarget}
        />
      )}

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deleteTarget?.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function DepartmentDialog({ open, onOpenChange, department }: { open: boolean; onOpenChange: (v: boolean) => void; department?: any }) {
  const queryClient = useQueryClient();
  const isEdit = !!department;
  const [name, setName] = useState(department?.name || "");
  const [code, setCode] = useState(department?.code || "");
  const [description, setDescription] = useState(department?.description || "");

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? apiClient.updateDepartment(department.id, data) : apiClient.createDepartment(data),
    onSuccess: () => {
      toast.success(isEdit ? "Department updated" : "Department created");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      onOpenChange(false);
      setName(""); setCode(""); setDescription("");
    },
    onError: (err: any) => toast.error(err.message || "Failed"),
  });

  const handleSubmit = () => {
    if (!name || (!isEdit && !code)) { toast.error("Name and code are required"); return; }
    mutation.mutate(isEdit ? { name, description } : { name, code: code.toUpperCase(), description });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Department" : "New Department"}</DialogTitle>
          <DialogDescription>{isEdit ? "Update department details." : "Create a new department."}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Engineering" />
          </div>
          {!isEdit && (
            <div>
              <Label className="text-[12.5px] mb-1.5 block">Code * (2–5 letters, unique)</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. ENG" maxLength={5} />
            </div>
          )}
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : isEdit ? "Save changes" : "Create department"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
