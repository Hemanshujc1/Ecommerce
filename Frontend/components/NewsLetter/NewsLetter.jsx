"use client";
import React, { useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api.config";

const NewsLetter = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !name) { setError("All fields are required"); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/users/Newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Subscription failed"); return; }
      alert("Subscription successful!");
      setName(""); setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-violet-400 bg-[url('/images/pattern-bg.png')] bg-contain bg-center py-16 px-4 flex items-center justify-center">
      <div className="bg-[whitesmoke] bg-opacity-90 rounded-xl p-8 md:p-12 w-full max-w-2xl flex flex-col items-center gap-6 text-center shadow-lg">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Sign Up for our Newsletter</h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="text" name="name" value={name} required placeholder="Your Name"
            onChange={(e) => setName(e.target.value)}
            className="border-2 border-black rounded-md bg-white p-3 w-full"
          />
          <input
            type="email" name="email" value={email} required placeholder="Your Email Address"
            onChange={(e) => setEmail(e.target.value)}
            className="border-2 border-black rounded-md bg-white p-3 w-full"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="border-2 border-black rounded-md bg-white text-black py-3 font-semibold hover:scale-95 hover:bg-yellow-50 transition-all">
            SIGN UP
          </button>
        </form>
        <div className="text-sm text-gray-600 flex flex-col gap-1">
          <p>Subscribe to get the latest updates and offers.</p>
          <p>We respect your privacy.{" "}
            <Link href="/users/UnsubscribeNewsLetter" className="text-blue-500 underline">Unsubscribe</Link> at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsLetter;
