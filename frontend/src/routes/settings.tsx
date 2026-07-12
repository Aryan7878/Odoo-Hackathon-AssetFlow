import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { User, Building, Shield, Palette, LogOut, Check } from "lucide-react";

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
          <div className="rounded-2xl border border-border bg-card p-6 max-w-2xl">
            <h3 className="text-[15px] font-semibold">Appearance</h3>
            <p className="text-[12.5px] text-muted-foreground">Fine-tune how AssetFlow looks for you.</p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-medium">Compact mode</div>
                  <div className="text-[12px] text-muted-foreground">Reduce padding across tables and cards</div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-medium">High contrast</div>
                  <div className="text-[12px] text-muted-foreground">Stronger borders and typography</div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-medium">Reduced motion</div>
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
