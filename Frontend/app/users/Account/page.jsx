"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import OrderCard from "@/components/OrderCard/OrderCard";
import WishlistCard from "@/components/WishlistCard/WishlistCard";
import CartCard from "@/components/CartCard/CartCard";
import UserInteractionDashboard from "@/components/UserInteractionDashboard/UserInteractionDashboard";
import { RiShoppingCartLine, RiPokerHeartsLine, RiUser3Line, RiSettings3Line } from "react-icons/ri";
import { FaClipboardList, FaSignOutAlt, FaUserCircle, FaChartLine } from "react-icons/fa";
import { API_BASE_URL } from "@/lib/api.config";
import { HiOutlineMail } from "react-icons/hi";
import EditProfileForm from "@/components/EditProfileForm/EditProfileForm";

const Page = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/profile`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setUserProfile(data?.data || null);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileOverview userProfile={userProfile} loading={loading} />;
      case "wishlist":
        return (
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
              <p className="text-sm text-gray-500 font-light mt-1">Products you've saved for later.</p>
            </div>
            <WishlistCard />
          </div>
        );
      case "cart":
        return (
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Cart</h2>
              <p className="text-sm text-gray-500 font-light mt-1">Review your selections before checking out.</p>
            </div>
            <CartCard />
          </div>
        );
      case "orders":
        return (
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
              <p className="text-sm text-gray-500 font-light mt-1">Track status and review your previous purchases.</p>
            </div>
            <OrderCard userId={userProfile?._id || userProfile?.id} />
          </div>
        );
      case "editprofile":
        return <EditProfileForm />;
      case "analytics":
        return (
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
              <p className="text-sm text-gray-500 font-light mt-1">Overview of your activity and popular trends.</p>
            </div>
            <UserInteractionDashboard />
          </div>
        );
      default:
        return null;
    }
  };

  const handleLogout = () => {
    router.push("/users/logout");
  };

  const tabItems = [
    { id: "profile",     label: "Profile",   icon: RiUser3Line },
    { id: "wishlist",    label: "Wishlist",  icon: RiPokerHeartsLine },
    { id: "cart",        label: "Cart",      icon: RiShoppingCartLine },
    { id: "orders",      label: "Orders",    icon: FaClipboardList },
    { id: "editprofile", label: "Settings",  icon: RiSettings3Line },
    { id: "analytics",   label: "Analytics", icon: FaChartLine },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Header Banner */}
        <div className="bg-black text-white rounded-3xl p-8 relative overflow-hidden shadow-md">
          {/* Decorative background grid pattern */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                <FaUserCircle className="text-white text-5xl" />
              </div>
              <div className="text-center md:text-left space-y-1">
                <h1 className="text-3xl font-black tracking-tight">
                  {loading ? "Loading..." : userProfile?.name || "Welcome Back"}
                </h1>
                <p className="text-gray-400 font-light text-sm">
                  {loading ? "" : userProfile?.email || "Manage your account, orders, and details"}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-5 py-3 border border-white/20 text-xs font-bold uppercase tracking-wider rounded-xl text-white bg-white/10 hover:bg-white/20 transition duration-200 active:scale-95 shadow-sm"
            >
              <FaSignOutAlt className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
              <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 scrollbar-none">
                {tabItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex-shrink-0 lg:flex-shrink flex items-center px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 whitespace-nowrap ${
                        isActive
                          ? "bg-black text-white shadow-sm"
                          : "text-gray-650 hover:bg-gray-50 hover:text-black"
                      }`}
                    >
                      <Icon className="mr-2.5 text-base shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 bg-white border border-gray-100 rounded-3xl shadow-sm min-h-[500px]">
            {renderContent()}
          </div>
        </div>

      </div>
    </div>
  );
};

// Profile Overview Component
const ProfileOverview = ({ userProfile, loading }) => {
  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-7 bg-gray-150 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-150 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-40 bg-gray-150 rounded-2xl"></div>
            <div className="h-40 bg-gray-150 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Profile Overview</h2>
        <p className="text-sm text-gray-500 font-light mt-1">General overview of your user profile credentials.</p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Full Name Card */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl">
            <RiUser3Line />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</p>
            <p className="text-base font-bold text-gray-900">{userProfile?.name || "Not provided"}</p>
          </div>
        </div>

        {/* Email Card */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl text-xl">
            <HiOutlineMail />
          </div>
          <div className="space-y-0.5 truncate max-w-full">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</p>
            <p className="text-base font-bold text-gray-900 truncate">{userProfile?.email || "Not provided"}</p>
          </div>
        </div>

        {/* Username Card */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl text-xl">
            <FaUserCircle />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Username</p>
            <p className="text-base font-bold text-gray-900">{userProfile?.username || "Not provided"}</p>
          </div>
        </div>

      </div>

      {/* Detailed Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Details */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            Personal Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500 font-light">Age:</span>
              <span className="font-semibold text-gray-900">{userProfile?.age || "Not provided"}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500 font-light">Gender:</span>
              <span className="font-semibold text-gray-900 capitalize">{userProfile?.gender || "Not provided"}</span>
            </div>
          </div>
        </div>

        {/* Account Activity Summary */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            Account Statistics
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500 font-light">Registered On:</span>
              <span className="font-semibold text-gray-900">
                {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500 font-light">Role Status:</span>
              <span className="font-semibold text-gray-900 capitalize">{userProfile?.role || "User"}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Page;
