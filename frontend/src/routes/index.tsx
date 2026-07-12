import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RegisterAssetDialog } from "./assets";
import {
  Boxes, PackageCheck, PackageOpen, Wrench, RotateCcw, TriangleAlert,
  Plus, ArrowUpRight, Sparkles, Clock, ArrowLeftRight, CalendarClock,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · AssetPlanet" },
      { name: "description", content: "Real-time analytics for asset utilization, allocations and maintenance across your organization." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [registerOpen, setRegisterOpen] = useState(false);

  // Queries
  const statsQuery = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => apiClient.getDashboardStats(),
    refetchInterval: 30000, // auto refresh stats every 30s
  });

  const chartsQuery = useQuery({
    queryKey: ["dashboard", "charts"],
    queryFn: () => apiClient.getDashboardCharts(),
    refetchInterval: 30000,
  });

  const maintenanceQuery = useQuery({
    queryKey: ["maintenance", "latest"],
    queryFn: () => apiClient.getMaintenanceRequests(),
  });

  const allocationsQuery = useQuery({
    queryKey: ["allocations", "latest"],
    queryFn: () => apiClient.getAllocations({ limit: 5 }),
  });

  const stats = statsQuery.data;
  const charts = chartsQuery.data;

  const handleExportReport = () => {
    try {
      toast.loading("Generating dashboard report...", { id: "dash-export" });
      if (!stats) {
        toast.dismiss("dash-export");
        toast.error("Dashboard data is still loading. Please try again.");
        return;
      }

      // Generate a detailed report summary in text format
      const reportLines = [
        "===============================================",
        "           ASSETPANET WORKSPACE REPORT         ",
        "===============================================",
        `Generated on: ${new Date().toLocaleString()}`,
        `Environment: Development`,
        "",
        "--- WORKSPACE STATUS ---",
        `Total Assets:             ${stats.totalAssets || 0}`,
        `Available:                ${stats.availableAssets || 0}`,
        `Allocated:                ${stats.allocatedAssets || 0}`,
        `Under Maintenance:        ${stats.underMaintenanceAssets || 0}`,
        `Retired Assets:           ${stats.retiredAssets || 0}`,
        `Upcoming Returns (7d):    ${stats.upcomingReturns || 0}`,
        `Overdue Assets:           ${stats.overdueAssets || 0}`,
        `Open Bookings:            ${stats.activeBookings || 0}`,
        `Pending Maintenance:      ${stats.pendingMaintenance || 0}`,
        "",
        "--- ASSETS BY CATEGORY ---",
        ...(charts?.assetsByCategory?.map((c: any) => `${c.label.padEnd(25)}: ${c.value}`) || ["No category data"]),
        "",
        "--- ASSETS BY DEPARTMENT ---",
        ...(charts?.assetsByDepartment?.map((d: any) => `${d.label.padEnd(25)}: ${d.value}`) || ["No department data"]),
        "",
        "--- MONTHLY ALLOCATION TREND ---",
        ...(charts?.monthlyAllocationTrend?.map((t: any) => `${t.month.padEnd(25)}: Allocations: ${t.allocations} | Returns: ${t.returns}`) || ["No trend data"]),
        "==============================================="
      ];

      const blob = new Blob([reportLines.join("\n")], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `workspace-report-${new Date().toISOString().slice(0, 10)}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      toast.dismiss("dash-export");
      toast.success("Dashboard report downloaded successfully.");
    } catch (err: any) {
      toast.dismiss("dash-export");
      toast.error(err.message || "Failed to generate report.");
    }
  };

  // Loading States
  const isLoading = statsQuery.isLoading || chartsQuery.isLoading;

  // Chart data mappings
  const trendData = charts?.monthlyAllocationTrend?.map((t: any) => {
    // Convert year-month to short name
    const parts = t.month.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIdx = parseInt(parts[1] || "1", 10) - 1;
    const name = monthIdx >= 0 && monthIdx < 12 ? monthNames[monthIdx] : t.month;
    return {
      month: name,
      allocated: t.allocations,
      available: t.returns,
    };
  }) || [];

  const statusChart = [
    { name: "Allocated", value: stats?.allocatedAssets || 0, color: "hsl(217 91% 60%)" },
    { name: "Available", value: stats?.availableAssets || 0, color: "hsl(160 84% 39%)" },
    { name: "Maintenance", value: stats?.underMaintenanceAssets || 0, color: "hsl(38 92% 50%)" },
    { name: "Retired", value: stats?.retiredAssets || 0, color: "hsl(0 0% 60%)" },
  ];

  const categoryChartData = charts?.assetsByCategory?.map((c: any) => ({
    name: c.label,
    value: c.value,
  })) || [];

  const departmentChartData = charts?.assetsByDepartment?.map((d: any) => ({
    name: d.label,
    value: d.value,
  })) || [];

  const activities = charts?.recentActivities?.map((a: any) => {
    const timeDiff = Math.max(1, Math.round((Date.now() - new Date(a.createdAt).getTime()) / 60000));
    let timeStr = `${timeDiff}m ago`;
    if (timeDiff >= 60 && timeDiff < 1440) {
      timeStr = `${Math.floor(timeDiff / 60)}h ago`;
    } else if (timeDiff >= 1440) {
      timeStr = `${Math.floor(timeDiff / 1440)}d ago`;
    }
    return {
      id: a.id,
      who: a.userName || "System",
      action: a.action.toLowerCase().replace(/_/g, " "),
      target: a.details?.assetTag || a.details?.name || a.entityType || "Asset",
      time: timeStr,
    };
  }) || [];

  const latestMaintenance = maintenanceQuery.data?.slice(0, 5).map((m: any) => ({
    id: m.id,
    asset: m.asset?.name || "Asset",
    description: m.description,
    status: m.status,
  })) || [];

  const latestAllocations = allocationsQuery.data?.data?.slice(0, 5).map((a: any) => ({
    id: a.id,
    asset: a.asset?.name || "Asset",
    employee: a.allocatedTo ? `${a.allocatedTo.firstName} ${a.allocatedTo.lastName}` : "Employee",
    department: a.allocatedTo?.department?.name || "Corporate",
    status: a.status === "ACTIVE" ? "Allocated" : "Returned",
  })) || [];

  if (isLoading) {
    return (
      <AppShell title="Dashboard" description="Loading real-time overview...">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground font-medium">Fetching real-time asset data...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Dashboard"
      description="A real-time overview of asset utilization, allocations and open requests."
      breadcrumbs={[{ label: "AssetPlanet", to: "/" }, { label: "Dashboard" }]}
      actions={
        <>
          <Button variant="outline" size="sm" className="rounded-xl h-9" onClick={handleExportReport}>
            <ArrowUpRight className="h-4 w-4" /> Export report
          </Button>
          <Button size="sm" className="rounded-xl h-9" onClick={() => setRegisterOpen(true)}>
            <Plus className="h-4 w-4" /> Register asset
          </Button>
        </>
      }
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Assets" value={stats?.totalAssets?.toLocaleString() || "0"} icon={<Boxes className="h-5 w-5" />} />
        <StatCard label="Available" value={stats?.availableAssets?.toLocaleString() || "0"} icon={<PackageOpen className="h-5 w-5" />} tone="success" />
        <StatCard label="Allocated" value={stats?.allocatedAssets?.toLocaleString() || "0"} icon={<PackageCheck className="h-5 w-5" />} tone="info" />
        <StatCard label="In Maintenance" value={stats?.underMaintenanceAssets?.toLocaleString() || "0"} icon={<Wrench className="h-5 w-5" />} tone="warning" />
        <StatCard label="Upcoming Returns" value={stats?.upcomingReturns?.toLocaleString() || "0"} icon={<RotateCcw className="h-5 w-5" />} tone="info" />
        <StatCard label="Overdue" value={stats?.overdueAssets?.toLocaleString() || "0"} icon={<TriangleAlert className="h-5 w-5" />} tone="danger" />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">Asset transactions trend</h3>
              <p className="text-[12.5px] text-muted-foreground">Allocations vs Returns timeline</p>
            </div>
            <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Allocations</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Returns</span>
            </div>
          </div>
          <div className="h-72">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(220 13% 91%)", fontSize: 12 }} />
                  <Area type="monotone" dataKey="allocated" name="Allocations" stroke="hsl(217 91% 60%)" strokeWidth={2.5} fill="url(#gA)" />
                  <Area type="monotone" dataKey="available" name="Returns" stroke="hsl(160 84% 39%)" strokeWidth={2.5} fill="url(#gB)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No trend log data found</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-[15px] font-semibold text-foreground">Status distribution</h3>
          <p className="text-[12.5px] text-muted-foreground">Across all categories</p>
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChart} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {statusChart.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(220 13% 91%)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-1">
            {statusChart.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-[12.5px]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-foreground">{s.name}</span>
                </div>
                <span className="font-semibold text-foreground tabular-nums">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[15px] font-semibold">Assets by category</h3>
              <p className="text-[12.5px] text-muted-foreground">Top categories in inventory</p>
            </div>
          </div>
          <div className="h-72">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} angle={-18} height={50} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(220 13% 91%)", fontSize: 12 }} cursor={{ fill: "hsl(217 91% 60% / 0.06)" }} />
                  <Bar dataKey="value" fill="hsl(217 91% 60%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No categories data found</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[15px] font-semibold">Assets by department</h3>
              <p className="text-[12.5px] text-muted-foreground">Allocation footprint</p>
            </div>
          </div>
          <div className="h-72">
            {departmentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChartData} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11.5, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(220 13% 91%)", fontSize: 12 }} cursor={{ fill: "hsl(160 84% 39% / 0.06)" }} />
                  <Bar dataKey="value" fill="hsl(160 84% 39%)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No department allocations found</div>
            )}
          </div>
        </div>
      </div>

      {/* Activity + Quick actions */}
      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-semibold">Recent activity</h3>
              <p className="text-[12.5px] text-muted-foreground">Timeline across the workspace</p>
            </div>
          </div>
          {activities.length > 0 ? (
            <ol className="relative border-l border-border ml-2 space-y-4">
              {activities.map((a: any) => (
                <li key={a.id} className="pl-5 relative">
                  <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/10" />
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13px] text-foreground">
                      <span className="font-semibold">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.action}</span>{" "}
                      <span className="font-medium">{a.target}</span>
                    </p>
                    <span className="text-[11.5px] text-muted-foreground flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" /> {a.time}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">No recent activities logged</div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-[15px] font-semibold">Quick actions</h3>
            <p className="text-[12.5px] text-muted-foreground">Jump straight into common workflows</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <QuickAction icon={<Plus className="h-4 w-4" />} label="Register asset" tone="primary" onClick={() => setRegisterOpen(true)} />
              <QuickAction icon={<ArrowLeftRight className="h-4 w-4" />} label="Allocate" onClick={() => navigate({ to: "/allocations" })} />
              <QuickAction icon={<CalendarClock className="h-4 w-4" />} label="Book resource" onClick={() => navigate({ to: "/bookings" })} />
              <QuickAction icon={<Wrench className="h-4 w-4" />} label="Maintenance" onClick={() => navigate({ to: "/maintenance" })} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-[15px] font-semibold">AI insight</h3>
            </div>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed">
              Utilization is trending up 4.2% MoM. <span className="text-foreground font-medium">Engineering</span> may exhaust available laptops within 21 days — consider a procurement request.
            </p>
            <Button size="sm" className="mt-3 w-full rounded-xl">Draft procurement</Button>
          </div>
        </div>
      </div>

      {/* Bottom lists */}
      <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold">Latest maintenance requests</h3>
            <Button variant="ghost" size="sm" className="text-[12.5px]" onClick={() => navigate({ to: "/maintenance" })}>View board</Button>
          </div>
          {latestMaintenance.length > 0 ? (
            <div className="divide-y divide-border">
              {latestMaintenance.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 py-2.5">
                  <div className="h-9 w-9 rounded-lg bg-warning/15 text-warning-foreground grid place-items-center shrink-0">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-foreground truncate">{m.asset}</div>
                    <div className="text-[11.5px] text-muted-foreground truncate">{m.description}</div>
                  </div>
                  <StatusBadge status={m.status === "COMPLETED" ? "Resolved" : m.status === "IN_PROGRESS" ? "In Progress" : m.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">No maintenance requests found</div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold">Recent allocations</h3>
            <Button variant="ghost" size="sm" className="text-[12.5px]" onClick={() => navigate({ to: "/allocations" })}>View all</Button>
          </div>
          {latestAllocations.length > 0 ? (
            <div className="divide-y divide-border">
              {latestAllocations.map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 py-2.5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                    <ArrowLeftRight className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium truncate">{a.asset}</div>
                    <div className="text-[11.5px] text-muted-foreground truncate">
                      {a.employee} · {a.department}
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">No recent allocations found</div>
          )}
        </div>
      </div>

      {/* Register Dialog */}
      <RegisterAssetDialog open={registerOpen} onOpenChange={setRegisterOpen} />
    </AppShell>
  );
}

function QuickAction({ icon, label, tone, onClick }: { icon: React.ReactNode; label: string; tone?: "primary"; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`group flex items-center gap-2 rounded-xl px-3 py-3 text-[12.5px] font-medium transition text-left ${
      tone === "primary"
        ? "bg-primary text-primary-foreground hover:bg-primary/90"
        : "bg-muted text-foreground hover:bg-accent"
    }`}>
      <span className={`h-8 w-8 rounded-lg grid place-items-center ${tone === "primary" ? "bg-primary-foreground/15" : "bg-background"}`}>{icon}</span>
      {label}
    </button>
  );
}
