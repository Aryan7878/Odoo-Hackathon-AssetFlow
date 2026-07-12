import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/mock-data";
import {
  Plus, Laptop, Monitor, Smartphone, Keyboard, Router, Car, Armchair, KeyRound, MoreHorizontal,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Laptop, Monitor, Smartphone, Keyboard, Router, Car, Armchair, KeyRound,
};

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Categories · AssetFlow" }, { name: "description", content: "Organize your assets by category." }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <AppShell
      title="Categories"
      description="Group assets by type to streamline reports and allocations."
      breadcrumbs={[{ label: "AssetFlow", to: "/" }, { label: "Categories" }]}
      actions={<Button size="sm" className="rounded-xl h-9"><Plus className="h-4 w-4" /> New category</Button>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((c) => {
          const Icon = iconMap[c.icon] ?? Laptop;
          return (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5 card-hover">
              <div className="flex items-start justify-between">
                <div className="h-11 w-11 rounded-xl grid place-items-center" style={{ background: `${c.color}18`, color: c.color }}>
                  <Icon className="h-5 w-5" />
                </div>
                <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
              </div>
              <div className="mt-4">
                <div className="text-[15px] font-semibold text-foreground">{c.name}</div>
                <div className="mt-0.5 text-[12.5px] text-muted-foreground">{c.count} assets tracked</div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-6 w-6 rounded-full ring-2 ring-card" style={{ background: `${c.color}${["", "cc", "99", "66"][i]}` }} />
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="text-[12px] h-7">View →</Button>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
