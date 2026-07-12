import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Building2, Users, Boxes, MoreHorizontal } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/departments")({
  head: () => ({ meta: [{ title: "Departments · AssetFlow" }, { name: "description", content: "Manage departments and their asset allocations." }] }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiClient.getDepartments(),
  });

  const departments = departmentsQuery.data || [];

  return (
    <AppShell
      title="Departments"
      description="Team-level view of asset ownership, headcount and utilization."
      breadcrumbs={[{ label: "AssetFlow", to: "/" }, { label: "Departments" }]}
      actions={<Button size="sm" className="rounded-xl h-9"><Plus className="h-4 w-4" /> Add department</Button>}
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
            // Calculate a reasonable utilization percentage based on member count
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
                  <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
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
    </AppShell>
  );
}
