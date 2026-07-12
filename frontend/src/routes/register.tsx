import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, User, Phone, AlertCircle, ArrowRight, Building } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Request Access · AssetPlanet" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch departments for registration dropdown
  const departmentsQuery = useQuery({
    queryKey: ["departments", "signup"],
    queryFn: () => apiClient.getDepartments(),
  });

  const departments = departmentsQuery.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        firstName,
        lastName,
        email,
        password,
        phone: phone || undefined,
        departmentId: departmentId || undefined,
      };

      await apiClient.register(payload);
      
      // Successfully registered. Redirect to waiting page
      navigate({
        to: "/pending-approval",
        search: { email }
      });
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check password criteria.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-blue-900 text-primary-foreground p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-primary-soft/10 blur-3xl" />
        
        <div className="flex items-center gap-2.5 z-10">
          <div className="relative h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md grid place-items-center border border-white/20">
            <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[17px] font-bold tracking-tight">AssetPlanet</span>
        </div>

        <div className="my-auto z-10 space-y-6 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            Join AssetPlanet Today.
          </h1>
          <p className="text-primary-foreground/80 leading-relaxed text-[15px]">
            Submit a registration request to join your organization's workspace. All new accounts must be verified and approved by a system administrator before accessing dashboard metrics and allocations.
          </p>
        </div>

        <div className="z-10 text-[12.5px] text-primary-foreground/60 border-t border-white/10 pt-6">
          © 2026 AssetPlanet Technologies Ltd. All rights reserved.
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background overflow-y-auto">
        <div className="w-full max-w-[440px] space-y-8 py-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Request workspace access</h2>
            <p className="text-[13.5px] text-muted-foreground">
              Submit your profile details for administrator review.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive-soft p-4 flex gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-[13px] font-medium leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-[12.5px]">First name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10 rounded-xl h-11 border-border focus:ring-4 focus:ring-primary/10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-[12.5px]">Last name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-10 rounded-xl h-11 border-border focus:ring-4 focus:ring-primary/10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[12.5px]">Corporate email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jane.doe@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 rounded-xl h-11 border-border focus:ring-4 focus:ring-primary/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[12.5px]">Phone number (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 rounded-xl h-11 border-border focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="department" className="text-[12.5px]">Department (Optional)</Label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  id="department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full pl-10 pr-4 rounded-xl h-11 border border-border bg-card text-[13.5px] outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 appearance-none transition"
                >
                  <option value="">Select a department...</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[12.5px]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 chars, 1 uppercase, 1 special, 1 number"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 rounded-xl h-11 border-border focus:ring-4 focus:ring-primary/10"
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground px-1 leading-snug">
                Must contain at least 8 characters, one capital letter, one number, and one symbol.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-medium mt-4 flex items-center justify-center gap-2 group"
            >
              {isLoading ? "Submitting request..." : (
                <>
                  Submit Request <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-[13px] text-muted-foreground pt-2">
            Already have access?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
