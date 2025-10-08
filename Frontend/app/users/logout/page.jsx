"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const page = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks

    setIsLoggingOut(true);

    try {
      // Clear client-side storage first
      localStorage.removeItem("token");
      sessionStorage.clear();

      // Make the logout API call
      const res = await fetch("http://localhost:4001/users/logout", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // Don't throw error if logout fails on server - still redirect
      if (res.ok) {
        await res.json();
      }

      // Force a complete page refresh and redirect to ensure clean logout
      window.location.href = "/usersAuth/logoutcnf";
    } catch (error) {
      console.error("Logout error:", error);
      // Clear client storage even if server call fails
      localStorage.removeItem("token");
      sessionStorage.clear();
      // Force redirect with window.location for complete refresh
      window.location.href = "/usersAuth/logoutcnf";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[whitesmoke] py-10 px-4">
      <div className="flex w-full max-w-3xl shadow-lg rounded-2xl overflow-hidden bg-white">
        {/* Image Section */}
        <div className="relative w-1/2 hidden md:block">
          <Image
            width={300}
            height={200}
            src="/images/post-image4.jpg"
            alt="Logout Illustration"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Logout Message Section */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center text-center">
          <h2 className="text-3xl font-semibold text-black mb-4">
            You're About to Logout
          </h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to log out? You’ll miss the latest drops and
            exclusive offers!
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-black text-white py-2 px-6 rounded-xl hover:bg-gray-800 hover:scale-95 transition uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoggingOut ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Logging out...
                </div>
              ) : (
                "Confirm Logout"
              )}
            </button>
            <Link href="/users/Home">
              <button className="bg-white border border-black text-black py-2 px-6 rounded-xl hover:bg-gray-100 hover:scale-95 transition text-sm uppercase">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
