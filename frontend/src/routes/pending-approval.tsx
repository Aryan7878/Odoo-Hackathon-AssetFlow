import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, RefreshCw, LogOut, CheckCircle2, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";

interface PendingApprovalSearch {
  email?: string;
}

export const Route = createFileRoute("/pending-approval")({
  head: () => ({ meta: [{ title: "Access Pending · AssetPlanet" }] }),
  validateSearch: (search: Record<string, unknown>): PendingApprovalSearch => {
    return {
      email: search.email as string | undefined,
    };
  },
  component: PendingApprovalPage,
});

function PendingApprovalPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { logout, isAuthenticated, user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const emailAddress = search.email || user?.email || "your email address";

  useEffect(() => {
    // If the user is authenticated and their status is active, redirect to home
    if (isAuthenticated && user?.status === "ACTIVE" && user?.isVerified) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, user, navigate]);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setStatusMessage(null);
    try {
      // If the user has a token, check current user details
      if (isAuthenticated) {
        const currentUser = await apiClient.getMe();
        if (currentUser.status === "ACTIVE" && currentUser.isVerified) {
          setStatusMessage("Congratulations! Your account has been approved.");
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
          return;
        }
      }
      
      // If not approved yet, simulate a check delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatusMessage("Your registration is still pending review. Please wait or contact your administrator.");
    } catch (err: any) {
      setStatusMessage(err.message || "Failed to fetch status.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-3xl" />

      <div className="w-full max-w-[500px] text-center space-y-8 z-10">
        <div className="flex justify-center">
          <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 grid place-items-center shadow-lg shadow-primary/20">
            <Sparkles className="h-8 w-8 text-primary-foreground" strokeWidth={2} />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-soft space-y-6 relative overflow-hidden">
          {/* Subtle pulse line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-warning/40 via-warning to-warning/40 animate-pulse" />

          <div className="space-y-3">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning text-[12px] font-semibold">
              <Clock className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} /> Awaiting Approval
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Waiting for Admin Approval</h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Your registration request for <span className="font-semibold text-foreground">{emailAddress}</span> has been submitted and is currently in review.
            </p>
          </div>

          <div className="bg-muted/50 rounded-2xl p-5 border border-border/40 text-left space-y-3">
            <h4 className="text-[12.5px] font-bold uppercase tracking-wider text-muted-foreground">What happens next?</h4>
            <ul className="space-y-2.5 text-[13px] text-foreground">
              <li className="flex gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                <span>An administrator will review your department and job designation details.</span>
              </li>
              <li className="flex gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                <span>Upon approval, your status changes to <strong>Active</strong> and login will unlock automatically.</span>
              </li>
            </ul>
          </div>

          {statusMessage && (
            <div className="text-[13px] font-semibold text-primary py-1 px-4 rounded-xl bg-primary/5 border border-primary/10 animate-fade-in">
              {statusMessage}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="rounded-xl h-11 border-border flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground font-medium"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
            <Button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="rounded-xl h-11 flex items-center justify-center gap-2 font-medium"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} /> Check Status
            </Button>
          </div>
        </div>

        <div className="text-[12.5px] text-muted-foreground">
          Need immediate access? Contact your IT helpdesk team or supervisor.
        </div>
      </div>
    </div>
  );
}
