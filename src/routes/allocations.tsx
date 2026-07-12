import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { allocations, assets, employees } from "@/lib/mock-data";
import {
  Plus, ArrowLeftRight, RotateCcw, ArrowUpDown, PackageCheck, Clock, TriangleAlert,
} from "lucide-react";

export const Route = createFileRoute("/allocations")({
  head: () => ({ meta: [{ title: "Allocations · AssetFlow" }, { name: "description", content: "Manage active allocations, transfers and returns." }] }),
  component: AllocationsPage,
});

function AllocationsPage() {
  const [open, setOpen] = useState(false);
  return (
    <AppShell
      title="Allocations"
      description="Track who has what, when it's due back, and where things stand."
      breadcrumbs={[{ label: "AssetFlow", to: "/" }, { label: "Allocations" }]}
      actions={<Button size="sm" className="rounded-xl h-9" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New allocation</Button>}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active" value="812" icon={<PackageCheck className="h-5 w-5" />} tone="info" />
        <StatCard label="Due Soon" value="27" icon={<Clock className="h-5 w-5" />} tone="warning" />
        <StatCard label="Overdue" value="9" icon={<TriangleAlert className="h-5 w-5" />} tone="danger" />
        <StatCard label="Returned this week" value="42" icon={<RotateCcw className="h-5 w-5" />} tone="success" />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-[15px] font-semibold">Active allocations</h3>
            <p className="text-[12.5px] text-muted-foreground">Sorted by most recent</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 rounded-xl"><ArrowUpDown className="h-4 w-4" /> Sort</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr className="text-left">
                <th className="py-3 px-4 font-medium">Asset</th>
                <th className="py-3 px-2 font-medium">Employee</th>
                <th className="py-3 px-2 font-medium">Department</th>
                <th className="py-3 px-2 font-medium">Allocated</th>
                <th className="py-3 px-2 font-medium">Expected Return</th>
                <th className="py-3 px-2 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allocations.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30 transition">
                  <td className="py-3 px-4">
                    <div className="font-medium text-foreground">{a.asset}</div>
                    <div className="font-mono text-[11px] text-primary">{a.tag}</div>
                  </td>
                  <td className="py-3 px-2 text-foreground">{a.employee}</td>
                  <td className="py-3 px-2 text-muted-foreground">{a.department}</td>
                  <td className="py-3 px-2 text-muted-foreground">{a.allocatedDate}</td>
                  <td className="py-3 px-2 text-muted-foreground">{a.expectedReturn}</td>
                  <td className="py-3 px-2"><StatusBadge status={a.status} /></td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex gap-1.5">
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-[12px]"><RotateCcw className="h-3.5 w-3.5" /> Return</Button>
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-[12px]"><ArrowLeftRight className="h-3.5 w-3.5" /> Transfer</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AllocateDialog open={open} onOpenChange={setOpen} />
    </AppShell>
  );
}

function AllocateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            Allocate asset
          </DialogTitle>
          <DialogDescription>Assign an available asset to an employee.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Asset</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select an available asset" /></SelectTrigger>
              <SelectContent>
                {assets.filter((a) => a.status === "Available").map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.tag} · {a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Employee</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name} · {e.department}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[12.5px] mb-1.5 block">Allocated date</Label>
              <Input type="date" defaultValue="2026-07-12" />
            </div>
            <div>
              <Label className="text-[12.5px] mb-1.5 block">Expected return</Label>
              <Input type="date" />
            </div>
          </div>
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Notes</Label>
            <Textarea placeholder="Purpose, project code, etc." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onOpenChange(false)}>Allocate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
