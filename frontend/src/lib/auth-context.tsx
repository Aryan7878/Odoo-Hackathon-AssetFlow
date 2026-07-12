import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiClient } from "./api-client";

export type Role = "ADMIN" | "ASSET_MANAGER" | "EMPLOYEE";

export interface User {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: Role;
  status: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (tokens: { accessToken: string; refreshToken: string; user: User }) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAssetManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        setAccessToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = (tokens: { accessToken: string; refreshToken: string; user: User }) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(tokens.user));
    }
    setAccessToken(tokens.accessToken);
    setUser(tokens.user);
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    setAccessToken(null);
    setUser(null);
    // Call backend logout in background
    apiClient.logout().catch(() => {});
  };

  const isAuthenticated = !!accessToken;
  const isAdmin = user?.role === "ADMIN";
  const isAssetManager = user?.role === "ASSET_MANAGER" || user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isAssetManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
