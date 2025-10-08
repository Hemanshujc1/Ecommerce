"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import OrderCard from "@/components/OrderCard/OrderCard";
import { RiShoppingCartLine, RiPokerHeartsLine, RiUser3Line, RiSettings3Line } from "react-icons/ri";
import { FaClipboardList, FaSignOutAlt, FaUserCircle, FaChartLine } from "react-icons/fa";
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
        const res = await fetch("http://localhost:4001/users/profile", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setUserProfile(data);
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
        router.push("/users/Wishlist");
        return null;
      case "cart":
        router.push("/users/Cart");
        return null;
      case "orders":
        return <OrderCard userId={30} />;
      case "editprofile":
        return <EditProfileForm/>;
      case "interactions":
        router.push("/users/Dashboard");
        return null;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    router.push("/users/logout");
  };

  const tabItems = [
    { id: "profile", label: "Profile", icon: RiUser3Line },
    { id: "wishlist", label: "Wishlist", icon: RiPokerHeartsLine },
    { id: "cart", label: "Cart", icon: RiShoppingCartLine },
    { id: "orders", label: "Orders", icon: FaClipboardList },
    { id: "editprofile", label: "Settings", icon: RiSettings3Line },
    { id: "interactions", label: "Analytics", icon: FaChartLine },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <FaUserCircle className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {loading ? "Loading..." : userProfile?.name || "Welcome Back"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {loading ? "" : userProfile?.email || "Manage your account and preferences"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <FaSignOutAlt className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <nav className="space-y-1 p-2">
                {tabItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        activeTab === item.id
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="mr-3 text-lg" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border min-h-[600px]">
              {renderContent()}
            </div>
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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-lg">
              <RiUser3Line className="text-white text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Full Name</p>
              <p className="text-lg font-semibold text-gray-900">{userProfile?.name || "Not provided"}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-lg">
              <HiOutlineMail className="text-white text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Email</p>
              <p className="text-lg font-semibold text-gray-900">{userProfile?.email || "Not provided"}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500 rounded-lg">
              <FaUserCircle className="text-white text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Username</p>
              <p className="text-lg font-semibold text-gray-900">{userProfile?.username || "Not provided"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Age:</span>
              <span className="font-medium">{userProfile?.age || "Not provided"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gender:</span>
              <span className="font-medium capitalize">{userProfile?.gender || "Not provided"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Member Since:</span>
              <span className="font-medium">
                {userProfile?.createdAt 
                  ? new Date(userProfile.createdAt).toLocaleDateString()
                  : "Not available"
                }
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Orders:</span>
              <span className="font-medium text-blue-600">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wishlist Items:</span>
              <span className="font-medium text-purple-600">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cart Items:</span>
              <span className="font-medium text-green-600">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
