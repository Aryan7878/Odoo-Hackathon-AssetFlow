import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { notifications } from "@/lib/mock-data";
import { CheckCircle2, TriangleAlert, Info, Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications · AssetFlow" }, { name: "description", content: "System alerts and updates for your workspace." }] }),
  component: NotificationsPage,
});

const icons = {
  success: { icon: CheckCircle2, cls: "bg-success/12 text-success" },
  info: { icon: Info, cls: "bg-info/12 text-info" },
  warning: { icon: TriangleAlert, cls: "bg-warning/15 text-warning-foreground" },
  danger: { icon: TriangleAlert, cls: "bg-destructive/12 text-destructive" },
} as const;

function NotificationsPage() {
  const unread = notifications.filter((n) => n.unread).length;
  return (
    <AppShell
      title="Notifications"
      description="Alerts, approvals and workflow updates from across AssetFlow."
      breadcrumbs={[{ label: "AssetFlow", to: "/" }, { label: "Notifications" }]}
      actions={<Button variant="outline" size="sm" className="rounded-xl h-9"><CheckCheck className="h-4 w-4" /> Mark all as read</Button>}
    >
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <Bell className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="text-[14px] font-semibold">Inbox</div>
            <div className="text-[12px] text-muted-foreground">{unread} unread · {notifications.length} total</div>
          </div>
        </div>
        <ul className="divide-y divide-border">
          {notifications.map((n) => {
            const cfg = icons[n.type];
            const Icon = cfg.icon;
            return (
              <li key={n.id} className={cn("flex items-start gap-3 p-4 transition hover:bg-muted/30", n.unread && "bg-primary/3")}>
                <div className={cn("h-10 w-10 rounded-xl grid place-items-center shrink-0", cfg.cls)}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-semibold text-foreground">{n.title}</span>
                    {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground leading-relaxed">{n.body}</p>
                </div>
                <div className="text-[11.5px] text-muted-foreground shrink-0 whitespace-nowrap">{n.time}</div>
              </li>
            );
          })}
        </ul>
      </div>
    </AppShell>
  );
}
