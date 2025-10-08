"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
   // setError("");

    try {
      const res = await fetch("http://localhost:4001/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, username, gender, age, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      router.push("/usersAuth/login");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[whitesmoke] py-10 px-4">
      <div className="flex w-full max-w-4xl shadow-lg rounded-2xl overflow-hidden bg-white">
        {/* Left Image */}
        <div className="relative w-1/2 hidden md:block">
          <Image
          width={300}
          height={200}
            src="/images/post-image9.jpg"
            alt="Register Side Image"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Right Form Section */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold text-black mb-4">Create Your Account</h2>
          <p className="text-gray-600 mb-6">
            Register to access exclusive deals, collections, and updates.
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Username */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="johndoe123"
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                required
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-2">
              <label lassName="text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="gender"
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                required
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Age */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                id="age"
                type="number"
                placeholder="18"
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                required
                min={1}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              className="bg-black text-white py-2 px-6 rounded-xl hover:bg-gray-800 hover:scale-95 transition uppercase text-sm"
            >
              Register
            </button>

            {/* Link */}
            <div className="text-sm text-center text-gray-500">
              Already have an account?{" "}
              <Link href="/usersAuth/login" className="text-black hover:underline">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
