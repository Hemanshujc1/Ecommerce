"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const page = () => {
  const router = useRouter();

  useEffect(() => {
    // Clear any stored session data (customize as needed)
    localStorage.removeItem("token");
    sessionStorage.clear();
    // If using cookies: document.cookie = "token=; Max-Age=0";
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[whitesmoke] px-6 py-12">
      <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg p-10 max-w-xl text-center">
        <div className="relative w-full h-32 mb-6">
          <Image
          width={300}
          height={200}
            src="/images/post-image5.jpg" // <-- Place image here or replace with your own
            alt="Logout Success"
            className="object-contain w-full h-full"
          />
        </div>

        <h1 className="text-3xl font-semibold text-black mb-3">You’ve Been Logged Out</h1>
        <p className="text-gray-600 mb-6">
          Thank you for visiting. You have successfully logged out of your account.
        </p>

        <div className="flex gap-4">
          <Link href="/usersAuth/login">
            <button className="bg-black text-white py-2 px-6 rounded-xl hover:bg-gray-800 hover:scale-95 transition text-sm uppercase">
              Login Again
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default page;
