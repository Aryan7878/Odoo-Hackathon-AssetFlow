import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Plus, Laptop, Monitor, Smartphone, Keyboard, Router, Car, Armchair, KeyRound, MoreHorizontal,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Categories · AssetFlow" }, { name: "description", content: "Organize your assets by category." }] }),
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
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.getCategories(),
  });

  const categories = categoriesQuery.data || [];

  return (
    <AppShell
      title="Categories"
      description="Group assets by type to streamline reports and allocations."
      breadcrumbs={[{ label: "AssetFlow", to: "/" }, { label: "Categories" }]}
      actions={<Button size="sm" className="rounded-xl h-9"><Plus className="h-4 w-4" /> New category</Button>}
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
                  <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
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
                  <Button variant="ghost" size="sm" className="text-[12px] h-7">View →</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
