import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Boxes,
  Tags,
  Building2,
  Users,
  ArrowLeftRight,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  Bell,
  Settings,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Assets", url: "/assets", icon: Boxes },
  { title: "Categories", url: "/categories", icon: Tags },
  { title: "Departments", url: "/departments", icon: Building2 },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Allocations", url: "/allocations", icon: ArrowLeftRight },
  { title: "Resource Booking", url: "/bookings", icon: CalendarClock },
  { title: "Maintenance", url: "/maintenance", icon: Wrench },
  { title: "Audit", url: "/audit", icon: ClipboardCheck },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) => (path === "/" ? currentPath === "/" : currentPath.startsWith(path));
  const { isAdmin } = useAuth();

  const menuItems = isAdmin
    ? [...items.slice(0, 10), { title: "Admin Panel", url: "/admin", icon: ShieldAlert }, items[10]]
    : items;

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border bg-sidebar z-40">
      {/* Brand */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-sidebar-border">
        <div className="relative h-9 w-9 rounded-xl bg-primary grid place-items-center shadow-[var(--shadow-glow)]">
          <Sparkles className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold text-sidebar-foreground tracking-tight">AssetFlow</div>
          <div className="text-[11px] text-muted-foreground font-medium">Enterprise ERP</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground px-3 pb-2 pt-1">
          Workspace
        </div>
        {menuItems.map((item) => {
          const active = isActive(item.url);
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className={cn("h-[17px] w-[17px] shrink-0", active ? "" : "text-muted-foreground group-hover:text-foreground")} strokeWidth={active ? 2.4 : 2} />
              <span className="truncate">{item.title}</span>
              {item.title === "Notifications" && (
                <span className={cn(
                  "ml-auto text-[10.5px] font-semibold px-1.5 py-0.5 rounded-md",
                  active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary",
                )}>3</span>
              )}
            </Link>
          );
        })}
      </nav>


    </aside>
  );
}
