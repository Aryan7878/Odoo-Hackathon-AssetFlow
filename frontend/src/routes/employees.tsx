import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Mail, Download, Info } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/employees")({
  head: () => ({ meta: [{ title: "Employees · AssetFlow" }, { name: "description", content: "Directory of employees and their assigned assets." }] }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const [search, setSearch] = useState("");

  const employeesQuery = useQuery({
    queryKey: ["employees", { search }],
    queryFn: () => apiClient.getEmployees({ limit: 100, search }),
  });

  const employees = employeesQuery.data?.data || [];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN": return "System Administrator";
      case "ASSET_MANAGER": return "Asset Manager";
      case "EMPLOYEE": return "Employee";
      default: return role;
    }
  };

  const handleExport = async () => {
    try {
      toast.loading("Preparing export...", { id: "emp-export" });
      const result = await apiClient.getEmployees({ limit: 1000, search });
      const rows = result?.data || [];
      if (rows.length === 0) {
        toast.dismiss("emp-export");
        toast.warning("No employees to export.");
        return;
      }
      const headers = ["Employee ID", "First Name", "Last Name", "Email", "Role", "Department", "Status", "Assigned Assets"];
      const escape = (v: any) => {
        if (v == null) return "";
        const s = String(v);
        return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const csvLines = [
        headers.join(","),
        ...rows.map((e: any) => [
          escape(e.employeeId),
          escape(e.firstName),
          escape(e.lastName),
          escape(e.email),
          escape(getRoleLabel(e.role)),
          escape(e.department?.name || "Corporate"),
          escape(e.status),
          escape(e._count?.allocations || 0),
        ].join(",")),
      ];
      const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `employees-export-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.dismiss("emp-export");
      toast.success(`Exported ${rows.length} employees.`);
    } catch (err: any) {
      toast.dismiss("emp-export");
      toast.error(err.message || "Export failed.");
    }
  };

  const handleAddEmployee = () => {
    toast.info(
      "New employees register at /register and are approved by an Admin.",
      { duration: 5000, icon: <Info className="h-4 w-4" /> }
    );
  };

  return (
    <AppShell
      title="Employees"
      description="Directory of team members with their assigned assets and roles."
      breadcrumbs={[{ label: "AssetFlow", to: "/" }, { label: "Employees" }]}
      actions={
        <>
          <Button variant="outline" size="sm" className="rounded-xl h-9" onClick={handleExport}><Download className="h-4 w-4" /> Export</Button>
          <Button size="sm" className="rounded-xl h-9" onClick={handleAddEmployee}><Plus className="h-4 w-4" /> Add employee</Button>
        </>
      }
    >
      <div className="rounded-2xl border border-border bg-card p-4 mb-4 flex items-center gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees…"
            className="pl-9 h-9 rounded-xl"
          />
        </div>
      </div>

      {employeesQuery.isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : employees.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">No employees found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((e: any) => {
            const avatar = `${e.firstName[0] || ""}${e.lastName[0] || ""}`.toUpperCase();
            const fullName = `${e.firstName} ${e.lastName}`;
            const allocationsCount = e._count?.allocations || 0;
            
            return (
              <div key={e.id} className="rounded-2xl border border-border bg-card p-5 card-hover">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 grid place-items-center text-primary-foreground font-semibold">
                    {avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold truncate">{fullName}</div>
                    <div className="text-[12px] text-muted-foreground truncate">{getRoleLabel(e.role)}</div>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> <span className="truncate">{e.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium text-foreground">{e.department?.name || "Corporate"}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground">Assigned assets</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/10 rounded-md px-1.5 py-0.5">
                      {allocationsCount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
