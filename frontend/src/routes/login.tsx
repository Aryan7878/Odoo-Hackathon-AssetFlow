import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, Chrome } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In · AssetFlow" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  // Extract query parameters for errors
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get("error");
      if (urlError) {
        if (urlError === "google_auth_failed") {
          setError("Google authentication failed. Please try again.");
        } else if (urlError === "token_error") {
          setError("An error occurred during authentication. Please contact support.");
        } else {
          setError(urlError);
        }
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await apiClient.login({ email, password });
      
      if (res.data && res.data.requiresApproval) {
        navigate({ to: "/pending-approval", search: { email: res.data.user.email } });
      } else {
        login({
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
          user: res.data.user,
        });
        navigate({ to: "/" });
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/v1/auth/google";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-blue-900 text-primary-foreground p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract shapes for premium aesthetic */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-primary-soft/10 blur-3xl" />
        
        <div className="flex items-center gap-2.5 z-10">
          <div className="relative h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md grid place-items-center border border-white/20">
            <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[17px] font-bold tracking-tight">AssetFlow</span>
        </div>

        <div className="my-auto z-10 space-y-6 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            Enterprise Asset Management, Reimagined.
          </h1>
          <p className="text-primary-foreground/80 leading-relaxed text-[15px]">
            Track lifecycle events, manage allocations, plan maintenance, and run audit cycles under a single, unified enterprise dashboard.
          </p>
        </div>

        <div className="z-10 text-[12.5px] text-primary-foreground/60 border-t border-white/10 pt-6">
          © 2026 AssetFlow Technologies Ltd. All rights reserved.
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign in to your account</h2>
            <p className="text-[13.5px] text-muted-foreground">
              Enter your corporate credentials to access the workspace.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive-soft p-4 flex gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-[13px] font-medium leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[12.5px]">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 rounded-xl h-11 border-border focus:ring-4 focus:ring-primary/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[12.5px]">Password</Label>
                <Link to="/login" className="text-[12px] font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 rounded-xl h-11 border-border focus:ring-4 focus:ring-primary/10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-medium mt-2 flex items-center justify-center gap-2 group"
            >
              {isLoading ? "Signing in..." : (
                <>
                  Sign in <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-background px-3 text-muted-foreground font-semibold">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-11 rounded-xl border-border flex items-center justify-center gap-2 hover:bg-muted font-medium"
          >
            <Chrome className="h-4 w-4" /> Continue with Google
          </Button>

          <p className="text-center text-[13px] text-muted-foreground pt-4">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Request access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
