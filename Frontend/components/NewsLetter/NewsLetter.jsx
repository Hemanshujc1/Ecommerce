"use client";
import React, { useState } from "react";
import Link from "next/link";

const NewsLetter = () => {
  const[name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !name) {
      setError("All fields are required");
      return;
    }
    try {
      const res = await fetch("http://localhost:4001/users/Newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Subscription failed");
        return;
      }
      alert("Subscription successful!");
      setName("");
      setEmail("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };
  return (
    <div className="bg-[url('/images/pattern-bg.png')] bg-violet-400 bg-contain bg-center min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-10 text-black text-center bg-[whitesmoke] p bg-opacity-50 p-10 rounded-md">
        <h1 className="text-3xl md:text-5xl font-bold">
          Sign Up for our Newsletter
        </h1>
        <form
          onSubmit={handleSubmit}
          className="w-full md:w-[60vw] flex flex-col gap-5 text-black"
        >
          <input
            type="text"
            name="name"
            value={name}
            required
            id="name"
            placeholder="Your Name"
            onChange={(e) => setName(e.target.value)}
            className="border-2 border-black rounded-md bg-[whitesmoke] p-3"
          />
          <input
            type="email"
            name="email"
            value={email}
            required
            id="email"
            placeholder="Your Email Address"
            onChange={(e) => setEmail(e.target.value)}
            className="border-2 border-black rounded-md bg-[whitesmoke] p-3"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="border-2 border-black rounded-md bg-[whitesmoke] text-black py-2 font-semibold hover:scale-95 hover:bg-yellow-50 cursor-pointer transition-all duration-300 flex items-center justify-center gap-2"
          >
            SIGN UP
          </button>
        </form>
        <div className="flex flex-col items-center gap-2">
        <p className="text-gray-600 text-sm">
          Subscribe to get the latest updates and offers.
        </p>
        <p className="text-gray-600 text-sm">
          We respect your privacy. <Link href="/users/UnsubscribeNewsLetter" className="text-blue-500 underline">Unsubscribe</Link> at any time.
        </p>
        </div>
      </div>
    </div>
  );
};

export default NewsLetter;
