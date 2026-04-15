"use client";
import React, { useState, useEffect } from "react";
import {
  IoLogoFacebook, IoLogoTwitter, IoLogoYoutube,
  IoLogoInstagram, IoLogoLinkedin, IoLogoWhatsapp,
} from "react-icons/io5";
import ImageContainer from "../ImageContainer/ImageContainer";
import { fetchSocialLinks } from "@/lib/api";
import Link from "next/link";

const UserFooter = () => {
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

  return (
    <>
      <ImageContainer />
      <footer className="bg-[whitesmoke] py-10 px-4">
        {/* Instagram CTA */}
        <div className="flex justify-center mb-8">
          <Link href={socialLinks.instagram || "#"} target="_blank" rel="noopener noreferrer">
            <button className="bg-white text-black px-6 py-3 font-semibold rounded-md hover:scale-95 transition shadow">
              Follow us on Instagram
            </button>
          </Link>
        </div>

        {/* Main footer grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <h1 className="text-xl font-bold">Ecommerce</h1>
            <p className="text-sm text-gray-600">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae error ipsa ullam quo velit corrupti.
            </p>
            <div className="flex gap-4 text-2xl text-gray-700">
              <Link href={socialLinks.facebook || "#"} target="_blank" rel="noopener noreferrer"><IoLogoFacebook className="hover:text-blue-600 transition" /></Link>
              <Link href={socialLinks.twitter || "#"} target="_blank" rel="noopener noreferrer"><IoLogoTwitter className="hover:text-sky-500 transition" /></Link>
              <Link href={socialLinks.linkedin || "#"} target="_blank" rel="noopener noreferrer"><IoLogoLinkedin className="hover:text-blue-700 transition" /></Link>
              <Link href={socialLinks.whatsapp || "#"} target="_blank" rel="noopener noreferrer"><IoLogoWhatsapp className="hover:text-green-500 transition" /></Link>
              <Link href={socialLinks.youtube || "#"} target="_blank" rel="noopener noreferrer"><IoLogoYoutube className="hover:text-red-600 transition" /></Link>
              <Link href={socialLinks.instagram || "#"} target="_blank" rel="noopener noreferrer"><IoLogoInstagram className="hover:text-pink-500 transition" /></Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Quick Links</h2>
            <ul className="flex flex-col gap-2 text-sm text-gray-600">
              <li><Link href="/users/Home" className="hover:underline">Home</Link></li>
              <li><Link href="/users/Products" className="hover:underline">Products</Link></li>
              <li><Link href="/users/Account" className="hover:underline">Orders</Link></li>
              <li><Link href="/users/Blogs" className="hover:underline">Blog</Link></li>
              <li><Link href="/users/ContactUs" className="hover:underline">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Contact</h2>
            <div className="text-sm text-gray-600 flex flex-col gap-2">
              <p>Questions or suggestions?</p>
              <p>contact@yourcompany.com</p>
              <p className="mt-2">Need support?</p>
              <p>+43 720 11 52 78</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-300 pt-4 max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <span>We ship with: DHL Porter &nbsp;|&nbsp; Payment: VISA, PAYPAL, MASTERCARD</span>
          <span>© 2024 Ecommerce. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
};

export default UserFooter;
