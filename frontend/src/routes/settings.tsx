import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Building, Shield, Palette, LogOut, Check } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · AssetPlanet" }, { name: "description", content: "Profile, company, roles and theme settings." }] }),
  component: SettingsPage,
});

const roles = [
  { name: "Admin", desc: "Full access across the workspace", count: 1, badge: "bg-primary/12 text-primary" },
  { name: "Asset Manager", desc: "Manage assets, allocations and maintenance", count: 2, badge: "bg-success/12 text-success" },
  { name: "Employee", desc: "View my assets, bookings and requests", count: 20, badge: "bg-muted text-muted-foreground" },
];

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient.getMe(),
  });

  const user = profileQuery.data || {};
  const fullName = user.firstName ? `${user.firstName} ${user.lastName}` : "";
  const avatar = user.firstName ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "??";
  const roleLabel = user.role === "ADMIN" ? "System Administrator" : user.role === "ASSET_MANAGER" ? "Asset Manager" : "Employee";

  // Local form state for profile editing
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Sync form when profile loads
  useEffect(() => {
    if (user.firstName) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phone || "");
    }
  }, [user.firstName, user.lastName, user.phone]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiClient.updateProfile(data),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to save profile"),
  });

  const handleSave = () => {
    if (!firstName || !lastName) {
      toast.error("First and last name are required");
      return;
    }
    updateProfileMutation.mutate({ firstName, lastName, phone: phone || undefined });
  };

  const handleDiscard = () => {
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setPhone(user.phone || "");
    toast.info("Changes discarded");
  };

  return (
    <AppShell
      title="Settings"
      description="Personal profile, company details, roles and theme preferences."
      breadcrumbs={[{ label: "AssetPlanet", to: "/" }, { label: "Settings" }]}
      actions={<Button onClick={logout} variant="outline" size="sm" className="rounded-xl h-9 text-destructive"><LogOut className="h-4 w-4" /> Sign out</Button>}
    >
      <Tabs defaultValue="profile">
        <TabsList className="rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg"><User className="h-3.5 w-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="company" className="rounded-lg"><Building className="h-3.5 w-3.5" /> Company</TabsTrigger>
          <TabsTrigger value="roles" className="rounded-lg"><Shield className="h-3.5 w-3.5" /> Roles</TabsTrigger>
          <TabsTrigger value="theme" className="rounded-lg"><Palette className="h-3.5 w-3.5" /> Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-5">
          {profileQuery.isLoading ? (
            <div className="flex h-36 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 max-w-3xl">
              <div className="flex items-center gap-4 pb-6 border-b border-border">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 grid place-items-center text-primary-foreground text-xl font-semibold">
                  {avatar}
                </div>
                <div>
                  <div className="text-[15px] font-semibold">{fullName || "—"}</div>
                  <div className="text-[12.5px] text-muted-foreground">{roleLabel} · {user.email}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto rounded-xl"
                  onClick={() => toast.info("Photo upload is not supported yet.")}
                >
                  Change photo
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <Label className="text-[12.5px] mb-1.5 block">First name</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-[12.5px] mb-1.5 block">Last name</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-[12.5px] mb-1.5 block">Email</Label>
                  <Input value={user.email || ""} disabled />
                </div>
                <div>
                  <Label className="text-[12.5px] mb-1.5 block">Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
                </div>
                <div>
                  <Label className="text-[12.5px] mb-1.5 block">Role</Label>
                  <Input value={roleLabel} disabled />
                </div>
                <div>
                  <Label className="text-[12.5px] mb-1.5 block">Employee ID</Label>
                  <Input value={user.employeeId || ""} disabled />
                </div>
              </div>
              <div className="mt-6 flex gap-2 justify-end">
                <Button variant="outline" onClick={handleDiscard} disabled={updateProfileMutation.isPending}>
                  Discard
                </Button>
                <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="company" className="mt-5">
          <div className="rounded-2xl border border-border bg-card p-6 max-w-3xl">
            <h3 className="text-[15px] font-semibold mb-4">Company details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-[12.5px] mb-1.5 block">Legal name</Label><Input defaultValue="AssetPlanet Technologies Ltd." /></div>
              <div><Label className="text-[12.5px] mb-1.5 block">Tax ID</Label><Input defaultValue="TAX-US-2026-9812" /></div>
              <div><Label className="text-[12.5px] mb-1.5 block">Headquarters</Label><Input defaultValue="100 Pine Street, San Francisco, CA" /></div>
              <div><Label className="text-[12.5px] mb-1.5 block">Fiscal year start</Label><Input type="date" defaultValue="2026-01-01" /></div>
              <div><Label className="text-[12.5px] mb-1.5 block">Currency</Label><Input defaultValue="USD · $" /></div>
              <div><Label className="text-[12.5px] mb-1.5 block">Timezone</Label><Input defaultValue="America/Los_Angeles" /></div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => toast.info("Changes discarded")}>Discard</Button>
              <Button onClick={() => toast.success("Company settings saved")}>Save changes</Button>
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
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full rounded-xl"
                  onClick={() => toast.info("Role permissions are managed by the system administrator.")}
                >
                  Edit permissions
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="theme" className="mt-5">
          <div className="rounded-2xl border border-border bg-card p-6 max-w-xl">
            <h3 className="text-[15px] font-semibold mb-4">Aesthetic Preferences</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                className="h-20 flex flex-col gap-2 rounded-xl"
                onClick={() => setTheme("light")}
              >
                Light Theme
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                className="h-20 flex flex-col gap-2 rounded-xl"
                onClick={() => setTheme("dark")}
              >
                Dark Theme
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                className="h-20 flex flex-col gap-2 rounded-xl"
                onClick={() => setTheme("system")}
              >
                System
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
