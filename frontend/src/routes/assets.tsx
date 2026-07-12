import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus, Filter, Download, Search, MoreHorizontal, Boxes, PackageCheck, PackageOpen, Wrench,
  ArrowLeftRight, Upload, Sparkles, Trash, Eye,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

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
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Stats query
  const statsQuery = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => apiClient.getDashboardStats(),
  });

  // Categories & Departments queries
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.getCategories(),
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiClient.getDepartments(),
  });

  // Assets list query
  const assetsQuery = useQuery({
    queryKey: ["assets", { page, limit, query, statusFilter, categoryFilter }],
    queryFn: () => apiClient.getAssets({
      page,
      limit,
      search: query,
      status: statusFilter,
      categoryId: categoryFilter,
    }),
  });

  // Active single asset query for side sheet
  const activeAssetQuery = useQuery({
    queryKey: ["assets", activeId],
    queryFn: () => apiClient.getAssetById(activeId!),
    enabled: !!activeId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteAsset(id),
    onSuccess: () => {
      toast.success("Asset deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      setActiveId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete asset");
    },
  });

  const assetsData = assetsQuery.data?.data || [];
  const pagination = assetsQuery.data?.pagination || { total: 0, totalPages: 1 };

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const formatCost = (val: any) => {
    if (!val) return "—";
    const num = parseFloat(val);
    return isNaN(num) ? "—" : `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (val: any) => {
    if (!val) return "—";
    return new Date(val).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getConditionName = (cond: string) => {
    switch (cond) {
      case "EXCELLENT": return "Excellent";
      case "GOOD": return "Good";
      case "FAIR": return "Fair";
      case "DAMAGED": return "Poor";
      default: return cond;
    }
  };

  const getStatusName = (stat: string) => {
    switch (stat) {
      case "AVAILABLE": return "Available";
      case "ALLOCATED": return "Allocated";
      case "UNDER_MAINTENANCE": return "Maintenance";
      case "RETIRED": return "Retired";
      case "LOST": return "Lost";
      default: return stat;
    }
  };

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
        <StatCard label="Total" value={statsQuery.data?.totalAssets?.toLocaleString() || "0"} icon={<Boxes className="h-5 w-5" />} />
        <StatCard label="Available" value={statsQuery.data?.availableAssets?.toLocaleString() || "0"} icon={<PackageOpen className="h-5 w-5" />} tone="success" />
        <StatCard label="Allocated" value={statsQuery.data?.allocatedAssets?.toLocaleString() || "0"} icon={<PackageCheck className="h-5 w-5" />} tone="info" />
        <StatCard label="Maintenance" value={statsQuery.data?.underMaintenanceAssets?.toLocaleString() || "0"} icon={<Wrench className="h-5 w-5" />} tone="warning" />
      </div>

      {/* Filters bar */}
      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="p-4 flex flex-wrap items-center gap-2.5 border-b border-border">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search by name or tag…" className="pl-9 h-9 rounded-xl" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40 h-9 rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Allocated">Allocated</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Retired">Retired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
            <SelectTrigger className="w-44 h-9 rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categoriesQuery.data?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table / Loading State */}
        {assetsQuery.isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading assets...</span>
            </div>
          </div>
        ) : assetsData.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <Boxes className="h-8 w-8 text-muted-foreground/50" />
            <div className="font-semibold text-foreground">No assets found</div>
            <div className="text-sm text-muted-foreground">Try adjusting your filters or search query.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-muted/40">
                <tr className="text-left text-muted-foreground">
                  <th className="w-10 py-3 px-4">
                    <Checkbox
                      checked={selected.length === assetsData.length && assetsData.length > 0}
                      onCheckedChange={(v) => setSelected(v ? assetsData.map((a: any) => a.id) : [])}
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
                {assetsData.map((a: any) => {
                  const currentAlloc = a.allocations?.find((al: any) => al.status === "ACTIVE");
                  const assignedUser = currentAlloc?.allocatedTo;
                  const assignedName = assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : null;
                  
                  return (
                    <tr key={a.id} className="hover:bg-muted/30 transition cursor-pointer" onClick={() => setActiveId(a.id)}>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selected.includes(a.id)} onCheckedChange={() => toggle(a.id)} />
                      </td>
                      <td className="py-3 px-2 font-mono text-[11.5px] font-medium text-primary">{a.assetTag}</td>
                      <td className="py-3 px-2 font-medium text-foreground">{a.name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{a.category?.name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{a.department?.name || "—"}</td>
                      <td className="py-3 px-2">
                        {assignedName ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-md bg-primary/10 text-primary text-[10px] font-semibold grid place-items-center">
                              {assignedName.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                            </div>
                            <span className="text-foreground">{assignedName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-2"><StatusBadge status={getConditionName(a.condition)} /></td>
                      <td className="py-3 px-2"><StatusBadge status={getStatusName(a.status)} /></td>
                      <td className="py-3 px-2 text-muted-foreground">{a.location || "—"}</td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => deleteMutation.mutate(a.id)}>
                          <Trash className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-[12.5px]">
            <div className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">{(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)}</span> of{" "}
              <span className="font-medium text-foreground">{pagination.total.toLocaleString()}</span> assets
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-8 rounded-lg" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button size="sm" className="h-8 w-8 rounded-lg p-0">{page}</Button>
              <Button variant="outline" size="sm" className="h-8 rounded-lg" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Details drawer */}
      <Sheet open={!!activeId} onOpenChange={(v) => !v && setActiveId(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {activeAssetQuery.isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : activeAssetQuery.data ? (
            (() => {
              const active = activeAssetQuery.data;
              const currentAlloc = active.allocations?.find((al: any) => al.status === "ACTIVE");
              const assignedName = currentAlloc?.allocatedTo ? `${currentAlloc.allocatedTo.firstName} ${currentAlloc.allocatedTo.lastName}` : null;
              
              return (
                <>
                  <SheetHeader>
                    <div className="flex items-center gap-2 text-[11.5px] font-mono text-primary">{active.assetTag}</div>
                    <SheetTitle className="text-xl">{active.name}</SheetTitle>
                    <SheetDescription>{active.category?.name} · {active.vendor || "No vendor"}</SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/0 border border-primary/15 aspect-video grid place-items-center">
                    <Boxes className="h-16 w-16 text-primary/40" strokeWidth={1.5} />
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      ["Status", <StatusBadge key="s" status={getStatusName(active.status)} />],
                      ["Condition", <StatusBadge key="c" status={getConditionName(active.condition)} />],
                      ["Department", active.department?.name || "—"],
                      ["Assigned to", assignedName ?? "—"],
                      ["Location", active.location || "—"],
                      ["Serial", <span key="sr" className="font-mono text-[12px]">{active.serialNumber || "—"}</span>],
                      ["Cost", formatCost(active.purchaseCost)],
                      ["Purchased", formatDate(active.purchaseDate)],
                      ["Warranty until", formatDate(active.warrantyExpiry)],
                      ["Vendor", active.vendor || "—"],
                    ].map(([label, val]) => (
                      <div key={label as string} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-[12.5px] text-muted-foreground">{label}</span>
                        <span className="text-[13px] font-medium text-foreground">{val}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Register modal */}
      <RegisterAssetDialog open={registerOpen} onOpenChange={setRegisterOpen} />
    </AppShell>
  );
}

export function RegisterAssetDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("basics");

  // Form State
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [condition, setCondition] = useState("GOOD");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");
  const [vendor, setVendor] = useState("");
  const [location, setLocation] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [description, setDescription] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.getCategories(),
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiClient.getDepartments(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createAsset(data),
    onSuccess: () => {
      toast.success("Asset registered successfully");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      onOpenChange(false);
      // Reset form
      setName("");
      setSerialNumber("");
      setCategoryId("");
      setDepartmentId("");
      setCondition("GOOD");
      setPurchaseDate("");
      setWarrantyExpiry("");
      setVendor("");
      setLocation("");
      setPurchaseCost("");
      setDescription("");
      setTab("basics");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to register asset");
    },
  });

  const handleSubmit = () => {
    if (!name || !categoryId) {
      toast.error("Name and Category are required");
      return;
    }
    
    const payload = {
      name,
      serialNumber: serialNumber || null,
      categoryId,
      departmentId: departmentId || null,
      condition,
      purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : null,
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry).toISOString() : null,
      vendor: vendor || null,
      location: location || null,
      purchaseCost: purchaseCost ? parseFloat(purchaseCost) : null,
      description: description || null,
    };

    createMutation.mutate(payload);
  };

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
              <Field label="Asset name *">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. MacBook Pro 16 M3" />
              </Field>
              <Field label="Serial number">
                <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="C02XL0…" />
              </Field>
              <Field label="Category *">
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categoriesQuery.data?.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Department">
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger><SelectValue placeholder="Assign to department" /></SelectTrigger>
                  <SelectContent>
                    {departmentsQuery.data?.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Condition">
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXCELLENT">Excellent</SelectItem>
                    <SelectItem value="GOOD">Good</SelectItem>
                    <SelectItem value="FAIR">Fair</SelectItem>
                    <SelectItem value="DAMAGED">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </TabsContent>
          <TabsContent value="details" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Purchase date">
                <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
              </Field>
              <Field label="Warranty until">
                <Input type="date" value={warrantyExpiry} onChange={(e) => setWarrantyExpiry(e.target.value)} />
              </Field>
              <Field label="Vendor">
                <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Apple Inc." />
              </Field>
              <Field label="Location">
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="HQ · Floor 4" />
              </Field>
              <Field label="Purchase cost">
                <Input type="number" value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} placeholder="2499.00" />
              </Field>
            </div>
            <Field label="Notes">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional notes…" />
            </Field>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Registering..." : "Register asset"}
          </Button>
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
