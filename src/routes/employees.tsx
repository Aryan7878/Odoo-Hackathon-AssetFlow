import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { employees } from "@/lib/mock-data";
import { Plus, Search, Mail, Download } from "lucide-react";

export const Route = createFileRoute("/employees")({
  head: () => ({ meta: [{ title: "Employees · AssetFlow" }, { name: "description", content: "Directory of employees and their assigned assets." }] }),
  component: EmployeesPage,
});

function EmployeesPage() {
  return (
    <AppShell
      title="Employees"
      description="Directory of team members with their assigned assets and roles."
      breadcrumbs={[{ label: "AssetFlow", to: "/" }, { label: "Employees" }]}
      actions={
        <>
          <Button variant="outline" size="sm" className="rounded-xl h-9"><Download className="h-4 w-4" /> Export</Button>
          <Button size="sm" className="rounded-xl h-9"><Plus className="h-4 w-4" /> Add employee</Button>
        </>
      }
    >
      <div className="rounded-2xl border border-border bg-card p-4 mb-4 flex items-center gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search employees…" className="pl-9 h-9 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {employees.map((e) => (
          <div key={e.id} className="rounded-2xl border border-border bg-card p-5 card-hover">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 grid place-items-center text-primary-foreground font-semibold">
                {e.avatar}
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold truncate">{e.name}</div>
                <div className="text-[12px] text-muted-foreground truncate">{e.role}</div>
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> <span className="truncate">{e.email}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium text-foreground">{e.department}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">Assigned assets</span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/10 rounded-md px-1.5 py-0.5">
                  {e.assets}
                </span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="rounded-lg h-8 flex-1 text-[12px]">View</Button>
              <Button size="sm" className="rounded-lg h-8 flex-1 text-[12px]">Allocate</Button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
