"use client";

import React, { useState } from "react";
import { API_BASE_URL } from "@/lib/api.config";

const page = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !message) {
      setError("All fields are required.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/Enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send message");
        return;
      }

      setSuccess("Message sent successfully!");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50 flex flex-col gap-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
        Contact Us
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
        {/* Left: Address & Map */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Our Address</h2>
            <p>123 StreetBite HQ</p>
            <p>MG Road, Bangalore, India</p>
            <p>Pin: 560001</p>
            <p className="mt-2 font-semibold">Phone: +91 98765 43210</p>
            <p>Email: contact@streetbite.com</p>
          </div>

          <div className="rounded shadow overflow-hidden aspect-video">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.3811708370404!2d72.86034207547827!3d19.22221274736557!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b1007590f83d%3A0xdb7044f1c87c7a15!2sSky%20City%20Tower%20D!5e0!3m2!1sen!2sin!4v1776244086088!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
            >
            </iframe>
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow space-y-4"
        >
          <h2 className="text-xl font-semibold mb-4">Send Us a Message</h2>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded"
          />
          <textarea
            name="message"
            rows="5"
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border rounded"
          ></textarea>

          {error && <p className="text-red-600">{error}</p>}
          {success && <p className="text-green-600">{success}</p>}

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default page;
