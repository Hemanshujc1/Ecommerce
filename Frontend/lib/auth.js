// lib/auth.js — client-side auth helpers

export const setUserSession = (userData) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(userData));
  localStorage.setItem("userId", userData.id);
  // Also set a cookie so Next.js middleware can read it
  document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400; SameSite=Lax`;
};

export const clearUserSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  document.cookie = "user=; path=/; max-age=0";
};

export const setAdminSession = (adminData) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("admin", JSON.stringify(adminData));
  document.cookie = `admin=${encodeURIComponent(JSON.stringify(adminData))}; path=/; max-age=86400; SameSite=Lax`;
};

export const clearAdminSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin");
  document.cookie = "admin=; path=/; max-age=0";
};

export const getUserId = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userId") || null;
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getAdmin = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("admin");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => !!getUser();
export const isAdminAuthenticated = () => !!getAdmin();
