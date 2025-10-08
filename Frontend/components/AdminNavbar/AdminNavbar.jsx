"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaTachometerAlt,
  FaUserShield,
  FaUsers,
  FaBoxOpen,
  FaBlog,
  FaClipboardList,
  FaEnvelope,
  FaLink,
  FaHome,
  FaEdit,
  FaSignOutAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";

const AdminNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await fetch("http://localhost:4001/admins/profile", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setAdminProfile(data);
        }
      } catch (err) {
        console.error("Failed to fetch admin profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const baseNavLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { href: "/admin/ManageUsers", label: "Manage Users", icon: <FaUsers /> },
    { href: "/admin/AddProducts", label: "Add Products", icon: <FaBoxOpen /> },
    { href: "/admin/ManageProducts", label: "Manage Products", icon: <FaBoxOpen /> },
    { href: "/admin/ManageBlogs", label: "Manage Blogs", icon: <FaBlog /> },
    { href: "/admin/ManageOrders", label: "Manage Orders", icon: <FaClipboardList /> },
    { href: "/admin/Enquiry", label: "Enquiry", icon: <FaEnvelope /> },
    { href: "/admin/ManageSocialLinks", label: "Manage Social Links", icon: <FaLink /> },
    { href: "/admin/HomePageControl", label: "Home Page Control", icon: <FaHome /> },
    { href: "/admin/EditLandingPage", label: "Edit Landing Page", icon: <FaEdit /> },
    { href: "/users/Home", label: "Go to Main Website", icon: <FaExternalLinkAlt /> },
  ];

  const navLinks = adminProfile?.role === 'main_admin' 
    ? [
        baseNavLinks[0], // Dashboard
        { href: "/admin/ManageAdmins", label: "Manage Admins", icon: <FaUserShield /> },
        ...baseNavLinks.slice(1) // Rest of the links
      ]
    : baseNavLinks;

  const handleAdminLogout = () => {
    router.push("/adminAuth/logout");
  };

  if (loading) {
    return (
      <div className="h-screen w-[25vw] bg-[#2a2a2a] text-white fixed top-0 left-0 flex flex-col justify-between shadow-lg z-50">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-center mb-8">Admin Panel</h1>
          <div className="flex flex-col gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-600 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-[25vw] bg-[#2a2a2a] text-white fixed top-0 left-0 flex flex-col justify-between shadow-lg z-50">
      <div className="p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          {adminProfile && (
            <div className="mt-1">
              <p className="text-sm text-gray-300">{adminProfile.name}</p>
              <p className="text-xs text-gray-400 capitalize">
                {adminProfile.role === 'main_admin' ? 'Main Admin' : 'Admin'}
              </p>
            </div>
          )}
        </div>
        <nav className="flex flex-col gap-3 overflow-y-auto">
          {navLinks.map(({ href, label, icon }, index) => (
            <Link key={index} href={href}>
              <div
                className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition hover:bg-gray-600 ${
                  pathname === href ? "bg-gray-600" : ""
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span className="text-base font-medium">{label}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4l">
        <button
          onClick={handleAdminLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-500 font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;
