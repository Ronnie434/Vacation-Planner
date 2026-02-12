"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import Cookies from "js-cookie";
import { getMe, login as apiLogin, loginWithGoogle } from "@/lib/api";
import type { UserProfile } from "@/types/api";

// Decode JWT payload to extract username (no secret needed for reading claims)
function getUserFromJWT(): UserProfile | null {
  const token = Cookies.get("JWT");
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    if (decoded.username) {
      return { username: decoded.username, email: "", user_level: "regular" };
    }
  } catch {
    // Invalid or expired token
  }
  return null;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginGoogle: () => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const profile = await getMe();
      if (profile && profile.username) {
        setUser(profile);
        return;
      }
    } catch {
      // /me endpoint failed — fall through to JWT decode
    }
    // Fallback: decode JWT from cookie to get username
    setUser(getUserFromJWT());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    // Set user immediately from login response
    setUser({ username: data.username, email: data.email, user_level: "regular" });
    // Enrich with full profile from /me
    try {
      const profile = await getMe();
      if (profile && profile.username) setUser(profile);
    } catch {
      // Already have user from login response
    }
  };

  const loginGoogle = () => {
    loginWithGoogle();
  };

  const logout = () => {
    Cookies.remove("JWT");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginGoogle,
        logout,
        refresh,
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
