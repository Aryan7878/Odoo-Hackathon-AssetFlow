import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/auth/google/callback")({
  component: GoogleCallbackPage,
});

function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get("accessToken");
      const refreshToken = params.get("refreshToken");

      if (accessToken && refreshToken) {
        // Temp save token so getMe calls succeed
        localStorage.setItem("accessToken", accessToken);
        apiClient.getMe()
          .then((user) => {
            login({ accessToken, refreshToken, user });
            navigate({ to: "/" });
          })
          .catch((err) => {
            localStorage.removeItem("accessToken");
            navigate({ to: "/login", search: { error: err.message || "Failed to log in" } });
          });
      } else {
        navigate({ to: "/login", search: { error: "Google authentication failed" } });
      }
    }
  }, [login, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground font-medium">Completing secure authentication...</span>
      </div>
    </div>
  );
}
