"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setUserId } from "../../../lib/auth";

const Page = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    console.log({email, password})
    e.preventDefault();
    setError("");
  
    try {
      const res = await fetch("http://localhost:4001/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // if your backend uses cookies
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Store user ID for cart/wishlist functionality
      if (data.user && data.user.id) {
        setUserId(data.user.id);
      }
  
      router.push("/users/Home"); // or wherever you want to redirect
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };
  

  return (
    <div className="flex min-h-screen items-center justify-center bg-[whitesmoke] py-10 px-4">
      <div className="flex w-full max-w-4xl shadow-lg rounded-2xl overflow-hidden bg-white">
        <div className="relative w-1/2 hidden md:block">
          <Image
          width={300}
          height={200}
            src="/images/post-image2.jpg"
            alt="Login Side Image"
            className="object-cover w-full h-full"
          />
        </div>

        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold text-black mb-6">Welcome Back</h2>
          <p className="text-gray-600 mb-8">
            Sign in to access your account and explore the latest collections.
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
               onChange ={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="bg-black text-white py-2 px-6 rounded-xl hover:bg-gray-800 hover:scale-95 transition uppercase text-sm"
            >
              Login
            </button>

            <div className="text-sm text-center text-gray-500">
              Don't have an account?{" "}
              <Link href="/usersAuth/Register" className="text-black hover:underline">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
