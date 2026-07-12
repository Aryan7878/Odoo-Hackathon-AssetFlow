import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { maintenance } from "@/lib/mock-data";
import { Plus, Wrench, Flag, User } from "lucide-react";

export const Route = createFileRoute("/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance · AssetFlow" }, { name: "description", content: "Kanban board of open maintenance requests." }] }),
  component: MaintenancePage,
});

const columns = [
  { key: "Pending", tone: "bg-muted-foreground/40" },
  { key: "Approved", tone: "bg-primary" },
  { key: "In Progress", tone: "bg-warning" },
  { key: "Resolved", tone: "bg-success" },
] as const;

function MaintenancePage() {
  return (
    <AppShell
      title="Maintenance"
      description="Kanban board of open service and repair requests across all assets."
      breadcrumbs={[{ label: "AssetFlow", to: "/" }, { label: "Maintenance" }]}
      actions={<Button size="sm" className="rounded-xl h-9"><Plus className="h-4 w-4" /> Raise request</Button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((c) => {
          const items = maintenance.filter((m) => m.status === c.key);
          return (
            <div key={c.key} className="rounded-2xl bg-muted/40 border border-border p-3">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`h-2 w-2 rounded-full ${c.tone}`} />
                <h3 className="text-[13px] font-semibold text-foreground">{c.key}</h3>
                <span className="ml-auto text-[11px] font-semibold text-muted-foreground bg-background rounded-md px-1.5 py-0.5">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {items.map((m) => (
                  <div key={m.id} className="rounded-xl bg-card border border-border p-3.5 card-hover">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-warning/15 text-warning-foreground grid place-items-center shrink-0">
                        <Wrench className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold truncate">{m.asset}</div>
                        <div className="font-mono text-[10.5px] text-primary">{m.tag}</div>
                      </div>
                    </div>
                    <p className="mt-2.5 text-[12px] text-muted-foreground line-clamp-2 leading-snug">{m.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <StatusBadge status={m.priority} />
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <User className="h-3 w-3" /> {m.reporter.split(" ")[0]}
                      </div>
                    </div>
                    <div className="mt-2 text-[10.5px] text-muted-foreground">Updated {m.updated}</div>
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
    </AppShell>
  );
}
