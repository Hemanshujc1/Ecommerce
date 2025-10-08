"use client";
import React, {useState} from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    //console.log({ email, password });
  
    try {
      const res = await fetch("http://localhost:4001/admins/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }
      router.push("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[whitesmoke] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <h2 className="text-3xl font-semibold mb-4 text-center">Admin Login</h2>
        <p className="text-gray-600 mb-6 text-center">
          Access your admin dashboard
        </p>

        <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Admin Email"
            onChange ={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            onChange ={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-black text-white py-2 px-6 rounded-xl hover:bg-gray-800 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
