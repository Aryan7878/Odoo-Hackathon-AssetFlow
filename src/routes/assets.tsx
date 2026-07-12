import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Filter, Download, Search, MoreHorizontal, Boxes, PackageCheck, PackageOpen, Wrench,
  ArrowLeftRight, Upload, Sparkles,
} from "lucide-react";
import { assets, categories, departments } from "@/lib/mock-data";
import type { Asset } from "@/lib/mock-data";

export const Route = createFileRoute("/assets")({
  head: () => ({
    meta: [
      { title: "Assets · AssetFlow" },
      { name: "description", content: "Search, filter and manage every asset in your organization." },
    ],
  }),
  component: AssetsPage,
});

function AssetsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [active, setActive] = useState<Asset | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const filtered = assets.filter((a) => {
    const matches = a.name.toLowerCase().includes(query.toLowerCase()) || a.tag.toLowerCase().includes(query.toLowerCase());
    const statusOk = statusFilter === "all" || a.status === statusFilter;
    const catOk = categoryFilter === "all" || a.category === categoryFilter;
    return matches && statusOk && catOk;
  });

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <AppShell
      title="Assets"
      description="Every physical and digital asset tracked in one place."
      breadcrumbs={[{ label: "AssetFlow", to: "/" }, { label: "Assets" }]}
      actions={
        <>
          <Button variant="outline" size="sm" className="rounded-xl h-9">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="rounded-xl h-9" onClick={() => setRegisterOpen(true)}>
            <Plus className="h-4 w-4" /> Add asset
          </Button>
        </>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value="1,136" icon={<Boxes className="h-5 w-5" />} />
        <StatCard label="Available" value="264" icon={<PackageOpen className="h-5 w-5" />} tone="success" />
        <StatCard label="Allocated" value="812" icon={<PackageCheck className="h-5 w-5" />} tone="info" />
        <StatCard label="Maintenance" value="38" icon={<Wrench className="h-5 w-5" />} tone="warning" />
      </div>

      {/* Filters bar */}
      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="p-4 flex flex-wrap items-center gap-2.5 border-b border-border">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or tag…" className="pl-9 h-9 rounded-xl" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-9 rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Allocated">Allocated</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Retired">Retired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44 h-9 rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 rounded-xl">
            <Filter className="h-4 w-4" /> More filters
          </Button>
          {selected.length > 0 && (
            <div className="ml-auto flex items-center gap-2 text-[12.5px]">
              <span className="text-muted-foreground">{selected.length} selected</span>
              <Button variant="outline" size="sm" className="h-8 rounded-lg">Bulk assign</Button>
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-destructive">Retire</Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/40">
              <tr className="text-left text-muted-foreground">
                <th className="w-10 py-3 px-4">
                  <Checkbox
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onCheckedChange={(v) => setSelected(v ? filtered.map((a) => a.id) : [])}
                  />
                </th>
                <th className="py-3 px-2 font-medium">Asset Tag</th>
                <th className="py-3 px-2 font-medium">Asset Name</th>
                <th className="py-3 px-2 font-medium">Category</th>
                <th className="py-3 px-2 font-medium">Department</th>
                <th className="py-3 px-2 font-medium">Assigned To</th>
                <th className="py-3 px-2 font-medium">Condition</th>
                <th className="py-3 px-2 font-medium">Status</th>
                <th className="py-3 px-2 font-medium">Location</th>
                <th className="py-3 px-4 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30 transition cursor-pointer" onClick={() => setActive(a)}>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selected.includes(a.id)} onCheckedChange={() => toggle(a.id)} />
                  </td>
                  <td className="py-3 px-2 font-mono text-[11.5px] font-medium text-primary">{a.tag}</td>
                  <td className="py-3 px-2 font-medium text-foreground">{a.name}</td>
                  <td className="py-3 px-2 text-muted-foreground">{a.category}</td>
                  <td className="py-3 px-2 text-muted-foreground">{a.department}</td>
                  <td className="py-3 px-2">
                    {a.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-primary/10 text-primary text-[10px] font-semibold grid place-items-center">
                          {a.assignedTo.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <span className="text-foreground">{a.assignedTo}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-2"><StatusBadge status={a.condition} /></td>
                  <td className="py-3 px-2"><StatusBadge status={a.status} /></td>
                  <td className="py-3 px-2 text-muted-foreground">{a.location}</td>
                  <td className="py-3 px-4"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-[12.5px]">
          <div className="text-muted-foreground">
            Showing <span className="font-medium text-foreground">1–{filtered.length}</span> of{" "}
            <span className="font-medium text-foreground">1,136</span> assets
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-8 rounded-lg">Previous</Button>
            <Button size="sm" className="h-8 w-8 rounded-lg p-0">1</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0">2</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0">3</Button>
            <span className="text-muted-foreground">…</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0">72</Button>
            <Button variant="outline" size="sm" className="h-8 rounded-lg">Next</Button>
          </div>
        </div>
      </div>

      {/* Details drawer */}
      <Sheet open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {active && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 text-[11.5px] font-mono text-primary">{active.tag}</div>
                <SheetTitle className="text-xl">{active.name}</SheetTitle>
                <SheetDescription>{active.category} · {active.vendor}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/0 border border-primary/15 aspect-video grid place-items-center">
                <Boxes className="h-16 w-16 text-primary/40" strokeWidth={1.5} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="rounded-xl flex-1"><ArrowLeftRight className="h-4 w-4" /> Allocate</Button>
                <Button variant="outline" size="sm" className="rounded-xl"><Wrench className="h-4 w-4" /> Maintenance</Button>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["Status", <StatusBadge key="s" status={active.status} />],
                  ["Condition", <StatusBadge key="c" status={active.condition} />],
                  ["Department", active.department],
                  ["Assigned to", active.assignedTo ?? "—"],
                  ["Location", active.location],
                  ["Serial", <span key="sr" className="font-mono text-[12px]">{active.serial}</span>],
                  ["Purchased", active.purchaseDate],
                  ["Warranty until", active.warrantyUntil],
                  ["Vendor", active.vendor],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-[12.5px] text-muted-foreground">{label}</span>
                    <span className="text-[13px] font-medium text-foreground">{val}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Register modal */}
      <RegisterAssetDialog open={registerOpen} onOpenChange={setRegisterOpen} />
    </AppShell>
  );
}

function RegisterAssetDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [tab, setTab] = useState("basics");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <Sparkles className="h-4 w-4" />
            </span>
            Register a new asset
          </DialogTitle>
          <DialogDescription>Add the asset to your inventory. Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="grid grid-cols-3 rounded-xl">
            <TabsTrigger value="basics" className="rounded-lg">1 · Basic info</TabsTrigger>
            <TabsTrigger value="details" className="rounded-lg">2 · Details</TabsTrigger>
            <TabsTrigger value="media" className="rounded-lg">3 · Media</TabsTrigger>
          </TabsList>
          <TabsContent value="basics" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Asset name *"><Input placeholder="e.g. MacBook Pro 16 M3" /></Field>
              <Field label="Asset tag *"><Input placeholder="AF-LT-00217" /></Field>
              <Field label="Serial number"><Input placeholder="C02XL0…" /></Field>
              <Field label="Category *">
                <Select><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Department">
                <Select><SelectTrigger><SelectValue placeholder="Assign to department" /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Condition">
                <Select defaultValue="Excellent"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </TabsContent>
          <TabsContent value="details" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Purchase date"><Input type="date" /></Field>
              <Field label="Warranty until"><Input type="date" /></Field>
              <Field label="Vendor"><Input placeholder="Apple Inc." /></Field>
              <Field label="Location"><Input placeholder="HQ · Floor 4" /></Field>
              <Field label="Status">
                <Select defaultValue="Available"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Allocated">Allocated</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Purchase cost"><Input placeholder="$2,499.00" /></Field>
            </div>
            <Field label="Notes"><Textarea placeholder="Optional notes…" /></Field>
          </TabsContent>
          <TabsContent value="media" className="mt-4">
            <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center bg-muted/30">
              <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <Upload className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[13px] font-medium">Drop image or click to upload</p>
              <p className="text-[12px] text-muted-foreground">PNG, JPG up to 5MB</p>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Save draft</Button>
          <Button onClick={() => onOpenChange(false)}>Register asset</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[12.5px] font-medium mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
