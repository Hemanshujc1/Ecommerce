"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const AdminLogoutConfirmation = () => {
  const router = useRouter();

  useEffect(() => {
    // Clear any stored session data
    localStorage.removeItem("token");
    sessionStorage.clear();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[whitesmoke] px-6 py-12">
      <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg p-10 max-w-xl text-center">
        <div className="relative w-full h-32 mb-6">
          <Image
            width={300}
            height={200}
            src="/images/post-image5.jpg"
            alt="Admin Logout Success"
            className="object-contain w-full h-full"
          />
        </div>

        <h1 className="text-3xl font-semibold text-black mb-3">Admin Logged Out Successfully</h1>
        <p className="text-gray-600 mb-6">
          You have been successfully logged out from the admin panel. Thank you for managing the system.
        </p>

        <div className="flex gap-4">
          <Link href="/adminAuth/login">
            <button className="bg-black text-white py-2 px-6 rounded-xl hover:bg-gray-800 hover:scale-95 transition text-sm uppercase">
              Login Again
            </button>
          </Link>
          <Link href="/users/Home">
            <button className="bg-white border border-black text-black py-2 px-6 rounded-xl hover:bg-gray-100 hover:scale-95 transition text-sm uppercase">
              Go to Main Site
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogoutConfirmation;