import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { departments } from "@/lib/mock-data";
import { Plus, Building2, Users, Boxes, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/departments")({
  head: () => ({ meta: [{ title: "Departments · AssetFlow" }, { name: "description", content: "Manage departments and their asset allocations." }] }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  return (
    <AppShell
      title="Departments"
      description="Team-level view of asset ownership, headcount and utilization."
      breadcrumbs={[{ label: "AssetFlow", to: "/" }, { label: "Departments" }]}
      actions={<Button size="sm" className="rounded-xl h-9"><Plus className="h-4 w-4" /> Add department</Button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {departments.map((d) => {
          const utilization = Math.min(100, Math.round((d.assets / (d.members * 4)) * 100));
          return (
            <div key={d.id} className="rounded-2xl border border-border bg-card p-5 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-foreground">{d.name}</div>
                    <div className="text-[12px] text-muted-foreground">Led by {d.head}</div>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wide"><Boxes className="h-3 w-3" /> Assets</div>
                  <div className="mt-0.5 text-[20px] font-semibold tabular-nums">{d.assets}</div>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wide"><Users className="h-3 w-3" /> Members</div>
                  <div className="mt-0.5 text-[20px] font-semibold tabular-nums">{d.members}</div>
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
    </AppShell>
  );
}
