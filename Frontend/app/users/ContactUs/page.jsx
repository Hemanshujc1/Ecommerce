"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api.config";
import { fetchSocialLinks } from "@/lib/api";
import {
  IoLogoFacebook, IoLogoTwitter, IoLogoYoutube,
  IoLogoInstagram, IoLogoLinkedin, IoLogoWhatsapp,
  IoLocationOutline, IoMailOutline, IoCallOutline
} from "react-icons/io5";

const Page = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    instagram: "", twitter: "", facebook: "", linkedin: "", youtube: "", whatsapp: "",
  });

  useEffect(() => {
    const getLinks = async () => {
      const data = await fetchSocialLinks();
      if (data?.data) setSocialLinks(data.data);
    };
    getLinks();
  }, []);

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
    <div className="bg-gray-50/50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full">
            Contact Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-light">
            We would love to hear from you. Whether you have questions about our luxury collections, orders, or partner programs, our team is here to assist.
          </p>
        </section>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Address, Map, and Socials (5 cols on large) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Info Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Our Office
              </h2>
              
              <div className="space-y-4 text-black text-sm sm:text-base font-light">
                <div className="flex items-start gap-4">
                  <IoLocationOutline className="text-xl text-gray-650 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">AURA Headquarters</p>
                    <p className="text-gray-500 text-sm">123 Luxury Boulevard, MG Road, Bangalore, KA, India - 560001</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <IoCallOutline className="text-xl text-gray-650 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Phone Support</p>
                    <p className="text-gray-500 text-sm">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <IoMailOutline className="text-xl text-gray-650 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Email Inquiries</p>
                    <p className="text-gray-500 text-sm">support@aurastore.com</p>
                  </div>
                </div>
              </div>

              {/* Social Channels Section */}
              <div className="border-t border-gray-100 pt-6 space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Connect With Us
                </h3>
                <div className="flex flex-wrap gap-3 text-2xl text-gray-700">
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-50 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition-all shadow-sm active:scale-90"
                      title="Instagram"
                    >
                      <IoLogoInstagram />
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-50 hover:bg-sky-50 hover:text-sky-500 rounded-xl transition-all shadow-sm active:scale-90"
                      title="Twitter"
                    >
                      <IoLogoTwitter />
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all shadow-sm active:scale-90"
                      title="LinkedIn"
                    >
                      <IoLogoLinkedin />
                    </a>
                  )}
                  {socialLinks.whatsapp && (
                    <a
                      href={socialLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-50 hover:bg-green-50 hover:text-green-500 rounded-xl transition-all shadow-sm active:scale-90"
                      title="WhatsApp"
                    >
                      <IoLogoWhatsapp />
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all shadow-sm active:scale-90"
                      title="Facebook"
                    >
                      <IoLogoFacebook />
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all shadow-sm active:scale-90"
                      title="YouTube"
                    >
                      <IoLogoYoutube />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Google Map Box */}
            <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden aspect-video relative group bg-white">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.3811708370404!2d72.86034207547827!3d19.22221274736557!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b1007590f83d%3A0xdb7044f1c87c7a15!2sSky%20City%20Tower%20D!5e0!3m2!1sen!2sin!4v1776244086088!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps"
                className="grayscale hover:grayscale-0 transition-all duration-700"
              ></iframe>
            </div>
          </div>

          {/* Right Column: Contact Form (7 cols on large) */}
          <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Send Us a Message
                </h2>
                <p className="text-sm text-gray-500 font-light">
                  Complete the form below and our specialists will respond within 24 hours.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="E.g., John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50/30 text-black text-sm focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="E.g., john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50/30 text-black text-sm focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="message" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    placeholder="How can we help you?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50/30 text-black text-sm focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition shadow-inner resize-none"
                  ></textarea>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 font-medium">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl border border-green-100 font-medium">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-black text-white py-4 rounded-2xl hover:bg-gray-800 transition-all font-bold text-xs uppercase tracking-wider active:scale-[0.98] shadow-md"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Page;
