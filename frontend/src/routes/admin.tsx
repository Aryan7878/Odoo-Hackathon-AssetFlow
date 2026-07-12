import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Users, UserCheck, UserX, UserMinus, Shield, Search, 
  Building, Mail, RefreshCw, KeyRound, Check, X, ShieldAlert
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui-kit";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "User Management · Admin" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const { user: currentUser, isAdmin, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [designation, setDesignation] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [userRole, setUserRole] = useState("EMPLOYEE");

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate({ to: "/" });
    }
  }, [isAdmin, authLoading, navigate]);

  // Query: Users matching filters
  const tabToStatus: Record<string, string> = {
    pending: "PENDING_APPROVAL",
    active: "ACTIVE",
    suspended: "SUSPENDED",
    rejected: "REJECTED",
  };

  const usersQuery = useQuery({
    queryKey: ["admin", "users", activeTab, searchTerm],
    queryFn: () => apiClient.adminGetUsers({
      search: searchTerm || undefined,
      status: tabToStatus[activeTab] || activeTab.toUpperCase(),
      limit: 100
    }),
    enabled: !!currentUser && isAdmin,
  });

  // Query: Departments
  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiClient.getDepartments(),
    enabled: !!currentUser && isAdmin,
  });

  const users = usersQuery.data?.data || [];
  const departments = departmentsQuery.data || [];

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (userId: string) => apiClient.approveUser(userId),
    onSuccess: () => {
      toast.success("User account approved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to approve user");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => apiClient.rejectUser(userId),
    onSuccess: () => {
      toast.success("User registration request rejected");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to reject user");
    }
  });

  const suspendMutation = useMutation({
    mutationFn: (userId: string) => apiClient.suspendUser(userId),
    onSuccess: () => {
      toast.success("User account suspended successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to suspend user");
    }
  });

  const activateMutation = useMutation({
    mutationFn: (userId: string) => apiClient.activateUser(userId),
    onSuccess: () => {
      toast.success("User account activated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to activate user");
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: string }) => apiClient.assignRole(userId, role),
    onSuccess: () => {
      toast.success("User role assigned successfully");
      setRoleModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to assign role");
    }
  });

  const updateDeptMutation = useMutation({
    mutationFn: ({ userId, departmentId, designation }: { userId: string, departmentId: string, designation: string }) => 
      apiClient.assignDepartment(userId, departmentId, designation),
    onSuccess: () => {
      toast.success("User department and designation updated");
      setDeptModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to assign department");
    }
  });

  const openDeptModal = (user: any) => {
    setSelectedUser(user);
    setDepartmentId(user.departmentId || "");
    setDesignation(user.designation || "");
    setDeptModalOpen(true);
  };

  const openRoleModal = (user: any) => {
    setSelectedUser(user);
    setUserRole(user.role || "EMPLOYEE");
    setRoleModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
        <ShieldAlert className="h-16 w-16 text-destructive animate-bounce" />
        <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground text-sm">Only system administrators can access this workspace.</p>
        <Button onClick={() => navigate({ to: "/" })} className="rounded-xl">Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <AppShell
      title="User Management"
      description="Review registrations, update roles, assign departments, and configure access control."
      breadcrumbs={[{ label: "AssetPlanet", to: "/" }, { label: "Admin Panel" }]}
    >
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <TabsList className="rounded-xl p-1 bg-muted/80 self-start">
            <TabsTrigger value="pending" className="rounded-lg flex gap-1.5 items-center text-[13px] px-3.5">
              <UserMinus className="h-4 w-4" /> Pending Approvals
            </TabsTrigger>
            <TabsTrigger value="active" className="rounded-lg flex gap-1.5 items-center text-[13px] px-3.5">
              <UserCheck className="h-4 w-4" /> Approved Users
            </TabsTrigger>
            <TabsTrigger value="suspended" className="rounded-lg flex gap-1.5 items-center text-[13px] px-3.5">
              <UserX className="h-4 w-4" /> Suspended
            </TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-lg flex gap-1.5 items-center text-[13px] px-3.5">
              <UserX className="h-4 w-4" /> Rejected
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 rounded-xl border-border bg-card text-[13px]"
            />
          </div>
        </div>

        {usersQuery.isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground text-left font-medium">
                    <th className="p-4 pl-6 font-semibold">User Details</th>
                    <th className="p-4 font-semibold">Employee ID</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Department & Designation</th>
                    <th className="p-4 font-semibold">Method</th>
                    <th className="p-4 pr-6 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {users.length > 0 ? (
                    users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 text-primary grid place-items-center text-[12.5px] font-bold">
                              {u.firstName[0]}{u.lastName[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{u.firstName} {u.lastName}</div>
                              <div className="text-[12.5px] text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-foreground tabular-nums">
                          {u.employeeId || "—"}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                            u.role === "ADMIN" 
                              ? "bg-destructive/10 text-destructive border border-destructive/20" 
                              : u.role === "ASSET_MANAGER"
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}>
                            <Shield className="h-3 w-3" /> {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          {u.department ? (
                            <div>
                              <div className="font-medium text-foreground">{u.department.name}</div>
                              <div className="text-[12px] text-muted-foreground">{u.designation || "No Designation"}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not Assigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="capitalize text-muted-foreground font-medium text-[12.5px]">{u.provider}</span>
                        </td>
                        <td className="p-4 pr-6 text-right space-x-1.5 whitespace-nowrap">
                          {activeTab === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectMutation.mutate(u.id)}
                                className="rounded-lg h-8 px-2.5 text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive text-[12px]"
                              >
                                <X className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => approveMutation.mutate(u.id)}
                                className="rounded-lg h-8 px-2.5 bg-success hover:bg-success/90 text-success-foreground text-[12px]"
                              >
                                <Check className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                            </>
                          )}

                          {activeTab === "active" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openDeptModal(u)}
                                className="rounded-lg h-8 text-[12px]"
                              >
                                <Building className="h-3.5 w-3.5 mr-1" /> Dept/Job
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openRoleModal(u)}
                                className="rounded-lg h-8 text-[12px]"
                              >
                                <KeyRound className="h-3.5 w-3.5 mr-1" /> Change Role
                              </Button>
                              {u.id !== currentUser.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => suspendMutation.mutate(u.id)}
                                  className="rounded-lg h-8 text-destructive border-destructive/20 hover:bg-destructive/5 text-[12px]"
                                >
                                  Suspend
                                </Button>
                              )}
                            </>
                          )}

                          {(activeTab === "suspended" || activeTab === "rejected") && (
                            <Button
                              size="sm"
                              onClick={() => activateMutation.mutate(u.id)}
                              className="rounded-lg h-8 text-[12px]"
                            >
                              Activate Account
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground font-medium">
                        No users found under this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Tabs>

      {/* Designation & Department Modal */}
      <Dialog open={deptModalOpen} onOpenChange={setDeptModalOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold">Assign Department & Designation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            {selectedUser && (
              <div className="text-[13px] bg-muted/50 rounded-xl p-3 border border-border/40">
                <span className="font-semibold text-foreground">{selectedUser.firstName} {selectedUser.lastName}</span>
                <span className="block text-muted-foreground text-[11.5px]">{selectedUser.email}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-[12.5px]">Department</Label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 rounded-xl h-10 border border-border bg-card text-[13px] outline-none focus:ring-4 focus:ring-primary/10"
              >
                <option value="">Select Department...</option>
                {departments.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12.5px]">Designation / Job Title</Label>
              <Input
                placeholder="Senior Product Designer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="rounded-xl h-10 text-[13px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeptModalOpen(false)} className="rounded-xl h-10">Cancel</Button>
            <Button
              onClick={() => updateDeptMutation.mutate({
                userId: selectedUser.id,
                departmentId,
                designation
              })}
              className="rounded-xl h-10"
            >
              Save Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Assignment Modal */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold">Assign Workspace Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            {selectedUser && (
              <div className="text-[13px] bg-muted/50 rounded-xl p-3 border border-border/40">
                <span className="font-semibold text-foreground">{selectedUser.firstName} {selectedUser.lastName}</span>
                <span className="block text-muted-foreground text-[11.5px]">{selectedUser.email}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-[12.5px]">Workspace Role</Label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-3 rounded-xl h-10 border border-border bg-card text-[13px] outline-none focus:ring-4 focus:ring-primary/10"
              >
                <option value="EMPLOYEE">Employee (Read my requests & bookings)</option>
                <option value="ASSET_MANAGER">Asset Manager (Manage lifecycle, bookings & requests)</option>
                <option value="ADMIN">Administrator (Full root workspace privileges)</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRoleModalOpen(false)} className="rounded-xl h-10">Cancel</Button>
            <Button
              onClick={() => updateRoleMutation.mutate({
                userId: selectedUser.id,
                role: userRole
              })}
              className="rounded-xl h-10"
            >
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
