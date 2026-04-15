"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/lib/api.config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // regular user
  const [admin, setAdmin] = useState(null);     // admin user
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAdmin = localStorage.getItem("admin");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      // Re-sync cookie in case it expired
      document.cookie = `user=${encodeURIComponent(storedUser)}; path=/; max-age=86400; SameSite=Lax`;
    }
    if (storedAdmin) {
      const parsed = JSON.parse(storedAdmin);
      setAdmin(parsed);
      document.cookie = `admin=${encodeURIComponent(storedAdmin)}; path=/; max-age=86400; SameSite=Lax`;
    }    setLoading(false);
  }, []);

  const loginUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  const loginAdmin = useCallback((adminData) => {
    setAdmin(adminData);
    localStorage.setItem("admin", JSON.stringify(adminData));
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/users/logout`, {
        credentials: "include",
      });
    } catch (_) {}
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
  }, []);

  const logoutAdmin = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/admins/logout`, {
        credentials: "include",
      });
    } catch (_) {}
    setAdmin(null);
    localStorage.removeItem("admin");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, admin, loading, loginUser, loginAdmin, logoutUser, logoutAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
