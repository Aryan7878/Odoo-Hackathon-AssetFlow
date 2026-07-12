import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Plus, Laptop, Monitor, Smartphone, Router, Car, Armchair, KeyRound, MoreHorizontal, Pencil, Trash, ArrowRight,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Categories · AssetPlanet" }, { name: "description", content: "Organize your assets by category." }] }),
  component: CategoriesPage,
});

const catMetadata: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  LPT: { icon: Laptop, color: "hsl(217 91% 60%)" },
  DSK: { icon: Monitor, color: "hsl(200 80% 45%)" },
  MON: { icon: Monitor, color: "hsl(160 84% 39%)" },
  MOB: { icon: Smartphone, color: "hsl(38 92% 50%)" },
  NET: { icon: Router, color: "hsl(0 84% 60%)" },
  FRN: { icon: Armchair, color: "hsl(30 60% 45%)" },
  VEH: { icon: Car, color: "hsl(280 65% 60%)" },
  LIC: { icon: KeyRound, color: "hsl(260 70% 55%)" },
};

function CategoriesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteTarget(null);
    },
    onError: (err: any) => toast.error(err.message || "Delete failed"),
  });

  const categories = categoriesQuery.data || [];

  return (
    <AppShell
      title="Categories"
      description="Group assets by type to streamline reports and allocations."
      breadcrumbs={[{ label: "AssetPlanet", to: "/" }, { label: "Categories" }]}
      actions={<Button size="sm" className="rounded-xl h-9" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New category</Button>}
    >
      {categoriesQuery.isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : categories.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">No categories registered.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((c: any) => {
            const meta = catMetadata[c.code] || { icon: Laptop, color: "hsl(217 91% 60%)" };
            const Icon = meta.icon;
            const count = c._count?.assets || 0;

            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-5 card-hover">
                <div className="flex items-start justify-between">
                  <div className="h-11 w-11 rounded-xl grid place-items-center" style={{ background: `${meta.color}18`, color: meta.color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/50 transition">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditTarget(c)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(c)}>
                        <Trash className="h-3.5 w-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4">
                  <div className="text-[15px] font-semibold text-foreground">{c.name}</div>
                  <div className="mt-0.5 text-[12.5px] text-muted-foreground">{count} assets tracked</div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-1.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-6 w-6 rounded-full ring-2 ring-card" style={{ background: `${meta.color}${["", "cc", "99", "66"][i]}` }} />
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[12px] h-7"
                    onClick={() => navigate({ to: "/assets", search: { categoryId: c.id } as any })}
                  >
                    View <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <CategoryDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Edit Dialog */}
      {editTarget && (
        <CategoryDialog
          open={!!editTarget}
          onOpenChange={(v) => !v && setEditTarget(null)}
          category={editTarget}
        />
      )}

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deleteTarget?.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function CategoryDialog({ open, onOpenChange, category }: { open: boolean; onOpenChange: (v: boolean) => void; category?: any }) {
  const queryClient = useQueryClient();
  const isEdit = !!category;
  const [name, setName] = useState(category?.name || "");
  const [code, setCode] = useState(category?.code || "");
  const [description, setDescription] = useState(category?.description || "");

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? apiClient.updateCategory(category.id, data) : apiClient.createCategory(data),
    onSuccess: () => {
      toast.success(isEdit ? "Category updated" : "Category created");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onOpenChange(false);
      setName(""); setCode(""); setDescription("");
    },
    onError: (err: any) => toast.error(err.message || "Failed"),
  });

  const handleSubmit = () => {
    if (!name || (!isEdit && !code)) { toast.error("Name and code are required"); return; }
    mutation.mutate(isEdit ? { name, description } : { name, code: code.toUpperCase(), description });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "New Category"}</DialogTitle>
          <DialogDescription>{isEdit ? "Update category details." : "Create a new asset category."}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Laptops" />
          </div>
          {!isEdit && (
            <div>
              <Label className="text-[12.5px] mb-1.5 block">Code * (3–5 letters, unique)</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. LPT" maxLength={5} />
            </div>
          )}
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : isEdit ? "Save changes" : "Create category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
