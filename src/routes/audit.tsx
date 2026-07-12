import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { audits } from "@/lib/mock-data";
import { ClipboardCheck, Building2, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Audit · AssetFlow" }, { name: "description", content: "Track department audit progress in real time." }] }),
  component: AuditPage,
});

function AuditPage() {
  const total = audits.reduce((a, d) => a + d.total, 0);
  const completed = audits.reduce((a, d) => a + d.completed, 0);
  const overall = Math.round((completed / total) * 100);

  return (
    <AppShell
      title="Audit"
      description="Real-time visibility into physical asset verification across departments."
      breadcrumbs={[{ label: "AssetFlow", to: "/" }, { label: "Audit" }]}
      actions={<Button size="sm" className="rounded-xl h-9"><ClipboardCheck className="h-4 w-4" /> Start audit round</Button>}
    >
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/8 via-card to-card p-6 mb-6">
        <div className="flex flex-wrap items-center gap-6 justify-between">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wide text-primary">Q3 2026 · Physical audit</div>
            <h2 className="mt-1 text-[22px] font-semibold tracking-tight">Overall progress · {overall}%</h2>
            <p className="text-[13px] text-muted-foreground">{completed} of {total} assets verified across 8 departments.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-[22px] font-semibold text-success">{completed}</div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Completed</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <div className="text-[22px] font-semibold text-warning-foreground">{total - completed}</div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Pending</div>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <Progress value={overall} className="h-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {audits.map((a) => {
          const pct = Math.round((a.completed / a.total) * 100);
          const done = pct === 100;
          return (
            <div key={a.id} className="rounded-2xl border border-border bg-card p-5 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold">{a.department}</div>
                    <div className="text-[12px] text-muted-foreground">{a.total} assets</div>
                  </div>
                </div>
                {done ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-success/12 rounded-md px-2 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-warning-foreground bg-warning/15 rounded-md px-2 py-1">
                    <Clock className="h-3.5 w-3.5" /> In progress
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-success-soft/60 p-3">
                  <div className="text-[11px] text-success font-semibold uppercase">Completed</div>
                  <div className="mt-0.5 text-[18px] font-semibold tabular-nums text-foreground">{a.completed}</div>
                </div>
                <div className="rounded-xl bg-muted/70 p-3">
                  <div className="text-[11px] text-muted-foreground font-semibold uppercase">Pending</div>
                  <div className="mt-0.5 text-[18px] font-semibold tabular-nums text-foreground">{a.pending}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-foreground">{pct}%</span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
