"use client";

import React, { useState } from "react";

const page = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    setStatus(null);
    setError("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4001/users/unsubscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unsubscribe failed");
        return;
      }

      setStatus("Successfully unsubscribed.");
      setEmail("");
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[whitesmoke] px-4">
      <form
        onSubmit={handleUnsubscribe}
        className="bg-white p-6 rounded shadow-md max-w-md w-full space-y-4"
      >
        <h2 className="text-xl font-semibold text-center">
          Unsubscribe from Newsletter
        </h2>

        <input
          type="email"
          name="email"
          required
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {status && <p className="text-green-600 text-sm">{status}</p>}

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
        >
          Unsubscribe
        </button>
      </form>
    </div>
  );
};

export default page;
