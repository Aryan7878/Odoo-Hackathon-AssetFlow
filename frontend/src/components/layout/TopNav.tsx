import { Search, Bell, ChevronDown, HelpCircle, Loader2, User, UserCheck, AlertCircle, Info, CheckCircle2, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function getNotificationIcon(type: string) {
  switch (type) {
    case "USER_REGISTERED":
    case "USER_APPROVED":
    case "USER_REJECTED":
    case "USER_SUSPENDED":
      return <UserCheck className="h-4 w-4 text-primary" />;
    case "ALERT":
    case "WARNING":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case "SUCCESS":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />;
  }
}

function getNotificationLink(notification: any): string | null {
  const title = (notification.title || "").toLowerCase();
  const message = (notification.message || "").toLowerCase();
  if (
    title.includes("pending") ||
    title.includes("user") ||
    message.includes("pending approval") ||
    message.includes("signed in via google") ||
    message.includes("awaiting approval") ||
    notification.type === "USER_REGISTERED"
  ) {
    return "/admin";
  }
  if (notification.relatedEntityType === "ASSET") return "/assets";
  if (notification.relatedEntityType === "MAINTENANCE") return "/maintenance";
  if (notification.relatedEntityType === "TRANSFER") return "/transfers";
  return null;
}

export function TopNav() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiClient.getNotifications(),
    refetchInterval: 30000, // refresh every 30s
    enabled: !!user,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiClient.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications: any[] = notificationsData || [];

  // Filter: only show user-related or important ones for admin; others for everyone
  const filtered = isAdmin
    ? notifications.slice(0, 10)
    : notifications.filter((n: any) => {
        const t = (n.type || "").toUpperCase();
        return !["USER_REGISTERED", "USER_APPROVED", "USER_REJECTED", "USER_SUSPENDED"].includes(t);
      }).slice(0, 10);

  const unread = filtered.filter((n: any) => !n.isRead).length;

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) markReadMutation.mutate(n.id);
    const link = getNotificationLink(n);
    setNotifOpen(false);
    if (link) navigate({ to: link as any });
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  const displayName = user ? `${user.firstName} ${user.lastName[0]}.` : "User";
  const roleLabel = user?.role === "ADMIN" ? "Admin" : user?.role === "ASSET_MANAGER" ? "Manager" : "Employee";

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="h-full flex items-center gap-3 px-5 lg:px-8">
        {/* Search */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search assets, employees, requests…"
            className="w-full h-10 rounded-xl bg-muted/60 border border-transparent focus:border-primary/40 focus:bg-background focus:ring-4 focus:ring-primary/10 outline-none pl-10 pr-4 text-[13.5px] placeholder:text-muted-foreground transition"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button className="hidden md:grid h-9 w-9 place-items-center rounded-lg hover:bg-muted text-muted-foreground transition">
            <HelpCircle className="h-[18px] w-[18px]" />
          </button>

          {/* Notifications Dropdown */}
          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <button className="relative grid h-9 w-9 place-items-center rounded-lg hover:bg-muted text-muted-foreground transition">
                <Bell className="h-[18px] w-[18px]" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9.5px] font-bold grid place-items-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[340px] rounded-2xl p-0 overflow-hidden shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-[14px] font-semibold text-foreground">Notifications</span>
                {unread > 0 && (
                  <span className="text-[11px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                    {unread} unread
                  </span>
                )}
              </div>

              <div className="max-h-[380px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                    <Bell className="h-8 w-8 opacity-30" />
                    <span className="text-[13px]">No notifications yet</span>
                  </div>
                ) : (
                  filtered.map((n: any) => {
                    const link = getNotificationLink(n);
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-muted/60 transition border-b border-border/50 last:border-0 ${!n.isRead ? "bg-primary/5" : ""}`}
                      >
                        <div className="mt-0.5 h-8 w-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                          {getNotificationIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[13px] leading-snug ${!n.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
                            {n.title}
                          </div>
                          <div className="text-[11.5px] text-muted-foreground mt-0.5 line-clamp-2">
                            {n.message}
                          </div>
                          {link && (
                            <div className="text-[11px] text-primary mt-1 font-medium">
                              Click to view →
                            </div>
                          )}
                        </div>
                        {!n.isRead && (
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {filtered.length > 0 && (
                <div className="px-4 py-2.5 border-t border-border">
                  <Link
                    to="/notifications"
                    className="text-[12.5px] text-primary font-medium hover:underline"
                    onClick={() => setNotifOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-border mx-1.5" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 pl-1.5 pr-2 h-10 rounded-xl hover:bg-muted transition">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 grid place-items-center text-primary-foreground text-[12.5px] font-semibold">
                  {initials || <User className="h-4 w-4" />}
                </div>
                <div className="text-left hidden md:block leading-tight">
                  <div className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
                    {displayName}
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                      {roleLabel}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{user?.email}</div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/settings">Profile settings</Link></DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild><Link to="/admin">Admin Panel</Link></DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
