import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { CheckCircle2, TriangleAlert, Info, Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications · AssetPlanet" }, { name: "description", content: "System alerts and updates for your workspace." }] }),
  component: NotificationsPage,
});

const icons = {
  SUCCESS: { icon: CheckCircle2, cls: "bg-success/12 text-success" },
  INFO: { icon: Info, cls: "bg-info/12 text-info" },
  WARNING: { icon: TriangleAlert, cls: "bg-warning/15 text-warning-foreground" },
  ERROR: { icon: TriangleAlert, cls: "bg-destructive/12 text-destructive" },
} as const;

function NotificationsPage() {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiClient.getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiClient.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to mark read");
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async (notificationsList: any[]) => {
      const unreadList = notificationsList.filter((n) => !n.isRead);
      await Promise.all(unreadList.map((n) => apiClient.markNotificationRead(n.id)));
    },
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err: any) => {
      toast.error("Failed to mark all as read");
    },
  });

  const notifications = notificationsQuery.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const formatRelativeTime = (dateStr: string) => {
    const timeDiff = Math.max(1, Math.round((Date.now() - new Date(dateStr).getTime()) / 60000));
    if (timeDiff < 60) return `${timeDiff}m ago`;
    if (timeDiff < 1440) return `${Math.floor(timeDiff / 60)}h ago`;
    return `${Math.floor(timeDiff / 1440)}d ago`;
  };

  return (
    <AppShell
      title="Notifications"
      description="Alerts, approvals and workflow updates from across AssetPlanet."
      breadcrumbs={[{ label: "AssetPlanet", to: "/" }, { label: "Notifications" }]}
      actions={
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl h-9"
          onClick={() => markAllReadMutation.mutate(notifications)}
          disabled={unreadCount === 0 || markAllReadMutation.isPending}
        >
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </Button>
      }
    >
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <Bell className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="text-[14px] font-semibold">Inbox</div>
            <div className="text-[12px] text-muted-foreground">{unreadCount} unread · {notifications.length} total</div>
          </div>
        </div>

        {notificationsQuery.isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No alerts in your inbox.</div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n: any) => {
              const cfg = icons[n.type as keyof typeof icons] || icons.INFO;
              const Icon = cfg.icon;
              
              return (
                <li
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 p-4 transition hover:bg-muted/30 cursor-pointer",
                    !n.isRead && "bg-primary/3"
                  )}
                  onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
                >
                  <div className={cn("h-10 w-10 rounded-xl grid place-items-center shrink-0", cfg.cls)}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-semibold text-foreground">{n.title}</span>
                      {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground leading-relaxed">{n.message}</p>
                  </div>
                  <div className="text-[11.5px] text-muted-foreground shrink-0 whitespace-nowrap">{formatRelativeTime(n.createdAt)}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
