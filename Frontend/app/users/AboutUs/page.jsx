"use client";

import React from "react";
import Image from "next/image";

const page = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <section className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">About StreetBite</h1>
          <p className="text-lg md:text-xl text-gray-600">
            Welcome to <strong>StreetBite</strong> – where flavor meets innovation. We’re not just an ecommerce platform;
            we’re a movement to make quality street-style food and lifestyle accessible online.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Our Story</h2>
            <p className="text-gray-600">
              Founded in 2024, StreetBite started with a simple idea: bring the energy and uniqueness of street
              experiences into every home. From trendy fashion to gourmet bites, we connect local flavors with global audiences.
            </p>
            <p className="text-gray-600">
              What began as a small local project has now grown into a recognized platform that celebrates culture, passion, and innovation.
            </p>
          </div>
          <div className="w-full h-auto rounded-lg overflow-hidden shadow">
            <Image
              src="/images/product-item-10.jpg"
              alt="Our Story"
              width={600}
              height={400}
              className="rounded-lg object-cover w-fill h-auto"
            />
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="w-full h-auto rounded-lg overflow-hidden shadow">
            <Image
              src="/images/product-item-9.jpg"
              alt="Our Mission"
              width={600}
              height={400}
              className="rounded-lg"
              style={{ objectFit: "cover", width: "100%", height: "auto" }}
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Our Mission</h2>
            <p className="text-gray-600">
              To empower creators, street artists, food innovators, and fashion-forward thinkers by providing a platform to shine.
            </p>
            <p className="text-gray-600">
              We aim to build a bridge between creativity and commerce — one bite, one style, and one click at a time.
            </p>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Join the StreetBite Journey</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Whether you’re a creator, a curious customer, or a community enthusiast — we invite you to be part of the StreetBite story.
          </p>
          <a
            href="/users/ContactUs"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
          >
            Contact Us
          </a>
        </section>
      </div>
    </div>
  );
};

export default page;
