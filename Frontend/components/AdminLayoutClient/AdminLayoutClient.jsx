"use client";
import { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import AdminNavbar from "@/components/AdminNavbar/AdminNavbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminLayoutClient({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const { admin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.push("/adminAuth/login");
    }
  }, [admin, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out
        lg:static lg:flex-shrink-0
        ${desktopCollapsed ? "w-20" : "w-64"}
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <AdminNavbar 
          onClose={() => setSidebarOpen(false)} 
          isCollapsed={desktopCollapsed}
          toggleCollapse={() => setDesktopCollapsed(!desktopCollapsed)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#2a2a2a] text-white sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-1" aria-label="Open menu">
            <FaBars size={20} />
          </button>
          <span className="font-bold text-lg">Admin Panel</span>
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
