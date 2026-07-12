import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import {
  Boxes, PackageCheck, PackageOpen, Wrench, RotateCcw, TriangleAlert,
  Plus, ArrowUpRight, Sparkles, Clock, ArrowLeftRight, CalendarClock,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import {
  assetsByCategoryChart, assetsByDepartmentChart, statusChart, trendChart,
  recentActivity, maintenance, allocations,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · AssetFlow" },
      { name: "description", content: "Real-time analytics for asset utilization, allocations and maintenance across your organization." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AppShell
      title="Dashboard"
      description="A real-time overview of asset utilization, allocations and open requests."
      breadcrumbs={[{ label: "AssetFlow", to: "/" }, { label: "Dashboard" }]}
      actions={
        <>
          <Button variant="outline" size="sm" className="rounded-xl h-9">
            <ArrowUpRight className="h-4 w-4" /> Export report
          </Button>
          <Button size="sm" className="rounded-xl h-9">
            <Plus className="h-4 w-4" /> Register asset
          </Button>
        </>
      }
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Assets" value="1,136" delta={{ value: "4.2% MoM", positive: true }} icon={<Boxes className="h-5 w-5" />} />
        <StatCard label="Available" value="264" delta={{ value: "12", positive: true }} icon={<PackageOpen className="h-5 w-5" />} tone="success" />
        <StatCard label="Allocated" value="812" delta={{ value: "3.1%", positive: true }} icon={<PackageCheck className="h-5 w-5" />} tone="info" />
        <StatCard label="In Maintenance" value="38" icon={<Wrench className="h-5 w-5" />} tone="warning" />
        <StatCard label="Upcoming Returns" value="27" icon={<RotateCcw className="h-5 w-5" />} tone="info" />
        <StatCard label="Overdue" value="9" delta={{ value: "2", positive: false }} icon={<TriangleAlert className="h-5 w-5" />} tone="danger" />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">Asset utilization trend</h3>
              <p className="text-[12.5px] text-muted-foreground">Last 7 months · Allocated vs Available</p>
            </div>
            <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Allocated</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Available</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendChart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
                <Area type="monotone" dataKey="allocated" stroke="hsl(217 91% 60%)" strokeWidth={2.5} fill="url(#gA)" />
                <Area type="monotone" dataKey="available" stroke="hsl(160 84% 39%)" strokeWidth={2.5} fill="url(#gB)" />
              </AreaChart>
            </ResponsiveContainer>
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
              <p className="text-[12.5px] text-muted-foreground">Top 8 categories</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetsByCategoryChart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} angle={-18} height={50} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(220 13% 91%)", fontSize: 12 }} cursor={{ fill: "hsl(217 91% 60% / 0.06)" }} />
                <Bar dataKey="value" fill="hsl(217 91% 60%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetsByDepartmentChart} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11.5, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(220 13% 91%)", fontSize: 12 }} cursor={{ fill: "hsl(160 84% 39% / 0.06)" }} />
                <Bar dataKey="value" fill="hsl(160 84% 39%)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
            <Button variant="ghost" size="sm" className="text-[12.5px]">View all</Button>
          </div>
          <ol className="relative border-l border-border ml-2 space-y-4">
            {recentActivity.map((a) => (
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
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-[15px] font-semibold">Quick actions</h3>
            <p className="text-[12.5px] text-muted-foreground">Jump straight into common workflows</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <QuickAction icon={<Plus className="h-4 w-4" />} label="Register asset" tone="primary" />
              <QuickAction icon={<ArrowLeftRight className="h-4 w-4" />} label="Allocate" />
              <QuickAction icon={<CalendarClock className="h-4 w-4" />} label="Book resource" />
              <QuickAction icon={<Wrench className="h-4 w-4" />} label="Maintenance" />
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
            <Button variant="ghost" size="sm" className="text-[12.5px]">View board</Button>
          </div>
          <div className="divide-y divide-border">
            {maintenance.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-2.5">
                <div className="h-9 w-9 rounded-lg bg-warning/15 text-warning-foreground grid place-items-center shrink-0">
                  <Wrench className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-foreground truncate">{m.asset}</div>
                  <div className="text-[11.5px] text-muted-foreground truncate">{m.description}</div>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold">Recent allocations</h3>
            <Button variant="ghost" size="sm" className="text-[12.5px]">View all</Button>
          </div>
          <div className="divide-y divide-border">
            {allocations.slice(0, 5).map((a) => (
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
        </div>
      </div>
    </AppShell>
  );
}

function QuickAction({ icon, label, tone }: { icon: React.ReactNode; label: string; tone?: "primary" }) {
  return (
    <button className={`group flex items-center gap-2 rounded-xl px-3 py-3 text-[12.5px] font-medium transition text-left ${
      tone === "primary"
        ? "bg-primary text-primary-foreground hover:bg-primary/90"
        : "bg-muted text-foreground hover:bg-accent"
    }`}>
      <span className={`h-8 w-8 rounded-lg grid place-items-center ${tone === "primary" ? "bg-primary-foreground/15" : "bg-background"}`}>{icon}</span>
      {label}
    </button>
  );
}
