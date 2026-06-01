"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const Page = () => {
  return (
    <div className="bg-gray-50/50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-20">
        
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full">
            Our Identity
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight">
            About <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500">AURA</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-light">
            Where sophistication meets modern innovation. We are a premium e-commerce platform curating high-end fashion, electronics, and lifestyle pieces designed to elevate your everyday living.
          </p>
        </section>

        {/* Brand Story (Image Left, Content Right) */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-md group">
            <Image
              src="/images/cat-item1.jpg"
              alt="AURA Brand Story"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-1 bg-black rounded"></div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Our Story</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base font-light">
              Founded in 2024, AURA started with a clear and singular vision: to bridge the gap between quality craftsmanship and digital convenience. We believe that everyday essentials, fashion, and cutting-edge technology should not only serve a purpose but also evoke an experience.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base font-light">
              What began as an ambitious project has quickly transformed into a premier digital destination, curated for those who value detail, design, and distinction.
            </p>
          </div>
        </section>

        {/* Brand Mission (Content Left, Image Right) */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:order-2">
            <div className="w-12 h-1 bg-black rounded"></div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base font-light">
              Our mission is to create an effortless shopping experience where modern styling, tech innovations, and luxury values converge. Every item in our catalog undergoes meticulous curation to ensure it matches the standards of our global audience.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base font-light">
              We empower creators and tech innovators by providing them a premium showcase, creating a direct bridge to discerning consumers who refuse to compromise.
            </p>
          </div>
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-md group md:order-1">
            <Image
              src="/images/cat-item2.jpg"
              alt="AURA Brand Mission"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl p-8 sm:p-12 shadow-sm grid sm:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">Uncompromising Quality</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              We source and select only premium products crafted with precision, durability, and aesthetics in mind.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">Seamless Experience</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              From intuitive discovery to secure, instant checkout, every step of your shopping journey is optimized.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">Customer Centricity</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              Our dedicated premium support team is always available to ensure your experience exceeds expectations.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-10 bg-black text-white rounded-3xl p-8 sm:p-12 space-y-6 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Elevate Your Standards
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto text-sm sm:text-base font-light">
            Step into the world of curated luxury. Explore our premium clothing, fashion, and tech collections today.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/users/Products"
              className="inline-block bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-100 font-bold transition text-sm active:scale-95 shadow-md"
            >
              Shop Collection
            </Link>
            <Link
              href="/users/ContactUs"
              className="inline-block bg-transparent text-white border border-white/30 px-6 py-3 rounded-xl hover:bg-white/10 hover:border-white font-bold transition text-sm active:scale-95"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Page;
