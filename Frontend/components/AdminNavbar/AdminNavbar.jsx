"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaTachometerAlt, FaUserShield, FaUsers, FaBoxOpen,
  FaBlog, FaClipboardList, FaEnvelope, FaLink,
  FaHome, FaEdit, FaSignOutAlt, FaExternalLinkAlt, FaTimes,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

const AdminNavbar = ({ onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { admin } = useAuth();

  const baseNavLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { href: "/admin/ManageUsers", label: "Manage Users", icon: <FaUsers /> },
    { href: "/admin/AddProducts", label: "Add Products", icon: <FaBoxOpen /> },
    { href: "/admin/ManageProducts", label: "Manage Products", icon: <FaBoxOpen /> },
    { href: "/admin/ManageBlogs", label: "Manage Blogs", icon: <FaBlog /> },
    { href: "/admin/ManageOrders", label: "Manage Orders", icon: <FaClipboardList /> },
    { href: "/admin/Enquiry", label: "Enquiry", icon: <FaEnvelope /> },
    { href: "/admin/ManageSocialLinks", label: "Social Links", icon: <FaLink /> },
    { href: "/admin/HomePageControl", label: "Home Page Control", icon: <FaHome /> },
    { href: "/admin/EditLandingPage", label: "Edit Landing Page", icon: <FaEdit /> },
    { href: "/users/Home", label: "Go to Website", icon: <FaExternalLinkAlt /> },
  ];

  const navLinks = admin?.role === "main_admin"
    ? [baseNavLinks[0], { href: "/admin/ManageAdmins", label: "Manage Admins", icon: <FaUserShield /> }, ...baseNavLinks.slice(1)]
    : baseNavLinks;

  return (
    <div className="h-full w-full bg-[#2a2a2a] text-white flex flex-col shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold">Admin Panel</h1>
          {admin && (
            <div className="mt-0.5">
              <p className="text-xs text-gray-300 truncate max-w-[160px]">{admin.name}</p>
              <p className="text-xs text-gray-400 capitalize">
                {admin.role === "main_admin" ? "Main Admin" : "Admin"}
              </p>
            </div>
          )}
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-white">
            <FaTimes size={18} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        {navLinks.map(({ href, label, icon }, i) => (
          <Link
            key={i}
            href={href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-600 ${
              pathname === href ? "bg-gray-600" : ""
            }`}
          >
            <span className="text-base flex-shrink-0">{icon}</span>
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-700 flex-shrink-0">
        <button
          onClick={() => { router.push("/adminAuth/logout"); onClose?.(); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-500 font-semibold rounded-lg hover:bg-gray-100 transition text-sm"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;
