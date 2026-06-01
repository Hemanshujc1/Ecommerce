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
    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 py-16 px-4 flex items-center justify-center relative overflow-hidden w-full">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 w-full max-w-2xl flex flex-col items-center gap-6 text-center shadow-2xl relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase">Sign Up for our Newsletter</h2>
        <p className="text-gray-300 text-sm sm:text-base max-w-md leading-relaxed">
          Subscribe to get the latest updates, exclusive offers, and early access to new collections.
        </p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-3 mt-2">
          <input
            type="text" 
            name="name" 
            value={name} 
            required 
            placeholder="Your Name"
            onChange={(e) => setName(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <input
            type="email" 
            name="email" 
            value={email} 
            required 
            placeholder="Your Email Address"
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button type="submit" className="bg-white text-black font-bold px-8 py-3.5 rounded-xl hover:bg-gray-150 active:scale-98 transition-all shrink-0 uppercase text-xs sm:text-sm tracking-wide">
            SIGN UP
          </button>
        </form>
        {error && <p className="text-red-405 text-sm">{error}</p>}
        <div className="text-xs text-gray-400 mt-2 flex flex-col gap-1">
          <p>We respect your privacy. No spam, ever.</p>
          <p>
            You can <Link href="/users/UnsubscribeNewsLetter" className="text-white underline hover:text-indigo-300 transition-colors">Unsubscribe</Link> at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsLetter;
