"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaTachometerAlt, FaUserShield, FaUsers, FaBoxOpen,
  FaBlog, FaClipboardList, FaEnvelope, FaLink,
  FaHome, FaEdit, FaSignOutAlt, FaExternalLinkAlt, FaTimes,
  FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

const AdminNavbar = ({ onClose, isCollapsed, toggleCollapse }) => {
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
    <div className="h-full w-full bg-[#2a2a2a] text-white flex flex-col shadow-lg relative transition-all duration-300">
      {/* Header */}
      <div className={`p-4 border-b border-gray-700 flex items-center flex-shrink-0 relative ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed ? (
          <div className="overflow-hidden transition-opacity duration-300">
            <h1 className="text-xl font-bold whitespace-nowrap">Admin Panel</h1>
            {admin && (
              <div className="mt-0.5">
                <p className="text-xs text-gray-300 truncate max-w-[160px]">{admin.name}</p>
                <p className="text-xs text-gray-400 capitalize whitespace-nowrap">
                  {admin.role === "main_admin" ? "Main Admin" : "Admin"}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="font-bold text-xl h-10 flex items-center justify-center">A</div>
        )}
        
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-white">
            <FaTimes size={18} />
          </button>
        )}
      </div>

      {/* Desktop Toggle Button */}
      {toggleCollapse && (
        <button 
          onClick={toggleCollapse}
          className="hidden lg:flex absolute top-5 -right-3 bg-blue-600 text-white p-1 rounded-full shadow-md z-50 hover:bg-blue-700 transition-colors"
        >
          {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
        </button>
      )}

      {/* Nav links */}
      <nav className={`flex-1 overflow-y-auto p-3 flex flex-col gap-1 overflow-x-hidden ${isCollapsed ? 'items-center' : ''}`}>
        {navLinks.map(({ href, label, icon }, i) => (
          <Link
            key={i}
            href={href}
            onClick={onClose}
            title={isCollapsed ? label : ""}
            className={`flex items-center gap-3 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-600 ${
              pathname === href ? "bg-gray-600" : ""
            } ${isCollapsed ? 'justify-center w-10 px-0' : 'px-3 w-full'}`}
          >
            <span className="text-base flex-shrink-0">{icon}</span>
            {!isCollapsed && <span className="truncate">{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-700 flex-shrink-0">
        <button
          onClick={() => { router.push("/adminAuth/logout"); onClose?.(); }}
          title={isCollapsed ? "Logout" : ""}
          className={`flex items-center justify-center gap-2 py-2 bg-white text-red-500 font-semibold rounded-lg hover:bg-gray-100 transition text-sm ${
             isCollapsed ? 'px-0 w-10 mx-auto' : 'px-4 w-full'
          }`}
        >
          <span className="flex-shrink-0"><FaSignOutAlt /></span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;
