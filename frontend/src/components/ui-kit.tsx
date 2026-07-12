import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  delta,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  delta?: { value: string; positive?: boolean };
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const toneMap: Record<string, string> = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
          <div className="mt-1.5 text-[28px] font-semibold tracking-tight text-foreground leading-none">{value}</div>
          {delta && (
            <div className={cn(
              "mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold px-1.5 py-0.5 rounded-md",
              delta.positive ? "text-success bg-success/10" : "text-destructive bg-destructive/10",
            )}>
              <span>{delta.positive ? "↑" : "↓"}</span>
              {delta.value}
            </div>
          )}
        </div>
        <div className={cn("h-10 w-10 rounded-xl grid place-items-center shrink-0", toneMap[tone])}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Available: "bg-success/12 text-success ring-success/20",
    Allocated: "bg-primary/12 text-primary ring-primary/20",
    Maintenance: "bg-warning/15 text-warning-foreground ring-warning/25",
    Retired: "bg-muted text-muted-foreground ring-border",
    Active: "bg-success/12 text-success ring-success/20",
    "Due Soon": "bg-warning/15 text-warning-foreground ring-warning/25",
    Overdue: "bg-destructive/12 text-destructive ring-destructive/20",
    Confirmed: "bg-success/12 text-success ring-success/20",
    Pending: "bg-muted text-muted-foreground ring-border",
    Approved: "bg-primary/12 text-primary ring-primary/20",
    "In Progress": "bg-warning/15 text-warning-foreground ring-warning/25",
    Resolved: "bg-success/12 text-success ring-success/20",
    Excellent: "bg-success/12 text-success ring-success/20",
    Good: "bg-primary/12 text-primary ring-primary/20",
    Fair: "bg-warning/15 text-warning-foreground ring-warning/25",
    Poor: "bg-destructive/12 text-destructive ring-destructive/20",
    Low: "bg-muted text-muted-foreground ring-border",
    Medium: "bg-info/15 text-info ring-info/25",
    High: "bg-warning/15 text-warning-foreground ring-warning/25",
    Critical: "bg-destructive/12 text-destructive ring-destructive/20",
  };
  const cls = map[status] ?? "bg-muted text-muted-foreground ring-border";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset", cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 lg:p-14 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 text-primary grid place-items-center">
        {icon}
      </div>
      <h3 className="mt-4 text-[16px] font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-[13.5px] text-muted-foreground max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
