import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { User, Building, Shield, Palette, LogOut, Check, Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · AssetFlow" }, { name: "description", content: "Profile, company, roles and theme settings." }] }),
  component: SettingsPage,
});

const roles = [
  { name: "Admin", desc: "Full access across the workspace", count: 4, badge: "bg-primary/12 text-primary" },
  { name: "Asset Manager", desc: "Manage assets, allocations and maintenance", count: 12, badge: "bg-success/12 text-success" },
  { name: "Employee", desc: "View my assets, bookings and requests", count: 224, badge: "bg-muted text-muted-foreground" },
];

function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <AppShell
      title="Settings"
      description="Personal profile, company details, roles and theme preferences."
      breadcrumbs={[{ label: "AssetFlow", to: "/" }, { label: "Settings" }]}
      actions={<Button variant="outline" size="sm" className="rounded-xl h-9 text-destructive"><LogOut className="h-4 w-4" /> Sign out</Button>}
    >
      <Tabs defaultValue="profile">
        <TabsList className="rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg"><User className="h-3.5 w-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="company" className="rounded-lg"><Building className="h-3.5 w-3.5" /> Company</TabsTrigger>
          <TabsTrigger value="roles" className="rounded-lg"><Shield className="h-3.5 w-3.5" /> Roles</TabsTrigger>
          <TabsTrigger value="theme" className="rounded-lg"><Palette className="h-3.5 w-3.5" /> Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-5">
          <div className="rounded-2xl border border-border bg-card p-6 max-w-3xl">
            <div className="flex items-center gap-4 pb-6 border-b border-border">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 grid place-items-center text-primary-foreground text-xl font-semibold">PR</div>
              <div>
                <div className="text-[15px] font-semibold">Priya Raghavan</div>
                <div className="text-[12.5px] text-muted-foreground">Engineering Lead · Admin</div>
              </div>
              <Button variant="outline" size="sm" className="ml-auto rounded-xl">Change photo</Button>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div><Label className="text-[12.5px] mb-1.5 block">Full name</Label><Input defaultValue="Priya Raghavan" /></div>
              <div><Label className="text-[12.5px] mb-1.5 block">Email</Label><Input defaultValue="priya.r@assetflow.io" /></div>
              <div><Label className="text-[12.5px] mb-1.5 block">Job title</Label><Input defaultValue="Engineering Lead" /></div>
              <div><Label className="text-[12.5px] mb-1.5 block">Phone</Label><Input defaultValue="+44 20 7946 0102" /></div>
              <div className="col-span-2"><Label className="text-[12.5px] mb-1.5 block">Bio</Label><Textarea defaultValue="Leads the platform engineering team. Owns the internal tooling roadmap." /></div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <Button variant="outline">Discard</Button>
              <Button>Save changes</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="company" className="mt-5">
          <div className="rounded-2xl border border-border bg-card p-6 max-w-3xl">
            <h3 className="text-[15px] font-semibold mb-4">Company details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-[12.5px] mb-1.5 block">Legal name</Label><Input defaultValue="AssetFlow Technologies Ltd." /></div>
              <div><Label className="text-[12.5px] mb-1.5 block">Tax ID</Label><Input defaultValue="GB 421 8802 11" /></div>
              <div><Label className="text-[12.5px] mb-1.5 block">Headquarters</Label><Input defaultValue="1 Finsbury Square, London" /></div>
              <div><Label className="text-[12.5px] mb-1.5 block">Fiscal year start</Label><Input type="date" defaultValue="2026-01-01" /></div>
              <div><Label className="text-[12.5px] mb-1.5 block">Currency</Label><Input defaultValue="GBP · £" /></div>
              <div><Label className="text-[12.5px] mb-1.5 block">Timezone</Label><Input defaultValue="Europe/London" /></div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => (
              <div key={r.name} className="rounded-2xl border border-border bg-card p-5 card-hover">
                <div className="flex items-start justify-between">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${r.badge}`}>{r.name}</span>
                  <span className="text-[12px] text-muted-foreground">{r.count} people</span>
                </div>
                <p className="mt-3 text-[13px] text-muted-foreground">{r.desc}</p>
                <ul className="mt-4 space-y-1.5 text-[12.5px]">
                  {["Assets", "Allocations", "Maintenance", "Bookings", "Audits"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-foreground">
                      <Check className="h-3.5 w-3.5 text-success" /> {f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" className="mt-4 w-full rounded-xl">Edit permissions</Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="theme" className="mt-5">
          <div className="rounded-2xl border border-border bg-card p-6 max-w-2xl animate-fade-in">
            <h3 className="text-[15px] font-semibold text-foreground">Appearance</h3>
            <p className="text-[12.5px] text-muted-foreground">Fine-tune how AssetFlow looks for you.</p>

            {/* Theme Selector */}
            <div className="mt-6 pb-6 border-b border-border">
              <Label className="text-[13px] font-medium block mb-3 text-foreground">Interface Theme</Label>
              <div className="grid grid-cols-3 gap-4">
                {/* Light Theme */}
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "group flex flex-col gap-2 rounded-xl border-2 p-2 text-left transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    theme === "light"
                      ? "border-primary bg-primary/5 text-primary shadow-[0_0_12px_rgba(37,99,235,0.08)]"
                      : "border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Mock Window Preview */}
                  <div className="aspect-[4/3] w-full rounded-lg border border-border bg-[#f8fafc] p-1.5 overflow-hidden flex flex-col gap-1">
                    <div className="flex gap-1 items-center pb-1 border-b border-slate-200">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      <div className="h-1 w-8 rounded bg-slate-200" />
                    </div>
                    <div className="flex gap-1.5 flex-1">
                      <div className="w-1/4 rounded bg-slate-200/60" />
                      <div className="flex-1 rounded bg-white border border-slate-100 p-1 flex flex-col gap-1">
                        <div className="h-1 w-3/4 rounded bg-slate-200" />
                        <div className="h-1 w-1/2 rounded bg-slate-100" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-1 py-0.5">
                    <Sun className="h-3.5 w-3.5" />
                    <span className="text-[13px] font-semibold">Light</span>
                  </div>
                </button>

                {/* Dark Theme */}
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "group flex flex-col gap-2 rounded-xl border-2 p-2 text-left transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    theme === "dark"
                      ? "border-primary bg-primary/5 text-primary shadow-[0_0_12px_rgba(37,99,235,0.08)]"
                      : "border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Mock Window Preview */}
                  <div className="aspect-[4/3] w-full rounded-lg border border-slate-800 bg-[#0f172a] p-1.5 overflow-hidden flex flex-col gap-1">
                    <div className="flex gap-1 items-center pb-1 border-b border-slate-800">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                      <div className="h-1 w-8 rounded bg-slate-800" />
                    </div>
                    <div className="flex gap-1.5 flex-1">
                      <div className="w-1/4 rounded bg-slate-800" />
                      <div className="flex-1 rounded bg-slate-900 border border-slate-800/80 p-1 flex flex-col gap-1">
                        <div className="h-1 w-3/4 rounded bg-slate-700" />
                        <div className="h-1 w-1/2 rounded bg-slate-800" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-1 py-0.5">
                    <Moon className="h-3.5 w-3.5" />
                    <span className="text-[13px] font-semibold">Dark</span>
                  </div>
                </button>

                {/* System Theme */}
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={cn(
                    "group flex flex-col gap-2 rounded-xl border-2 p-2 text-left transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    theme === "system"
                      ? "border-primary bg-primary/5 text-primary shadow-[0_0_12px_rgba(37,99,235,0.08)]"
                      : "border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Mock Window Preview */}
                  <div className="aspect-[4/3] w-full rounded-lg border border-border bg-[#f8fafc] p-1.5 overflow-hidden flex flex-col gap-1 relative">
                    {/* Split background */}
                    <div className="absolute inset-0 flex">
                      <div className="w-1/2 bg-[#f8fafc] border-r border-slate-200" />
                      <div className="w-1/2 bg-[#0f172a]" />
                    </div>
                    {/* Floating mock elements on top of the split background */}
                    <div className="relative z-10 flex flex-col gap-1 h-full">
                      <div className="flex gap-1 items-center pb-1 border-b border-slate-200/40">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <div className="h-1 w-8 rounded bg-slate-400/40" />
                      </div>
                      <div className="flex gap-1.5 flex-1">
                        <div className="w-1/4 rounded bg-slate-400/20" />
                        <div className="flex-1 rounded border border-slate-400/20 p-1 flex flex-col gap-1 bg-white/20 backdrop-blur-[1px]">
                          <div className="h-1 w-3/4 rounded bg-slate-400/40" />
                          <div className="h-1 w-1/2 rounded bg-slate-400/20" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-1 py-0.5">
                    <Laptop className="h-3.5 w-3.5" />
                    <span className="text-[13px] font-semibold">System</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-medium text-foreground">Compact mode</div>
                  <div className="text-[12px] text-muted-foreground">Reduce padding across tables and cards</div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-medium text-foreground">High contrast</div>
                  <div className="text-[12px] text-muted-foreground">Stronger borders and typography</div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-medium text-foreground">Reduced motion</div>
                  <div className="text-[12px] text-muted-foreground">Disable non-essential transitions</div>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
