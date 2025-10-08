"use client";

import React, { useEffect, useState } from "react";
import LandingPage from "@/components/LandingPage/LandingPage";
import ServiceCard from "@/components/ServiceCard/ServiceCard";
import { LuNotebookPen, LuShoppingBag, LuGift } from "react-icons/lu";
import { CiDeliveryTruck } from "react-icons/ci";
import ProductCard from "@/components/ProductCard/ProductCard";
import BlogPost from "@/components/BlogPost/BlogPost";
import NewsLetter from "@/components/NewsLetter/NewsLetter";
import Image from "next/image";
import Link from "next/link";

const Page = () => {
  const [productSections, setProductSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductSections = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:4001/home-products");
        const data = await res.json();

        // Handle different response formats
        let sections = [];
        if (data.sections) {
          // If sections is a string, parse it
          if (typeof data.sections === 'string') {
            sections = JSON.parse(data.sections);
          } else if (Array.isArray(data.sections)) {
            sections = data.sections;
          }
        }

        const transformed = sections.map((section) => ({
          title: section.sectionTitle || section.title || 'Untitled Section',
          items: section.products || [],
        }));

        setProductSections(transformed);
      } catch (error) {
        console.error("Failed to fetch product sections", error);
        setError("Failed to load homepage sections");
      } finally {
        setLoading(false);
      }
    };

    fetchProductSections();
  }, []);

  return (
    <div className="flex flex-col justify-center gap-12">
      <LandingPage  />

      {/* Services */}
      <div className="flex flex-wrap gap-4 justify-center py-4">
        <ServiceCard
          logo={LuNotebookPen}
          title="Book An Appointment"
          description="Lorem ipsum, dolor sit amet consectetur adipisicing elit."
        />
        <ServiceCard
          logo={LuShoppingBag}
          title="Pick up in store"
          description="Lorem ipsum, dolor sit amet consectetur adipisicing elit."
        />
        <ServiceCard
          logo={LuGift}
          title="Special packaging"
          description="Lorem ipsum, dolor sit amet consectetur adipisicing elit."
        />
        <ServiceCard
          logo={CiDeliveryTruck}
          title="Free global returns"
          description="Lorem ipsum, dolor sit amet consectetur adipisicing elit."
        />
      </div>

     

      {/* Dynamic Product Sections from Admin Panel */}
      {loading ? (
        /* Loading State */
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-gray-600 mt-4">Loading homepage sections...</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="text-center py-16">
          <p className="text-red-600 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : productSections.length > 0 ? (
        /* Product Sections */
        productSections.map((section, idx) => (
          <div key={idx}>
            <ProductCard title={section.title} items={section.items} />
            
            {/* Add promotional banner after the first section */}
            {idx === 0 && (
              <section className="bg-[whitesmoke] text-black w-[90vw] mx-auto rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row h-auto md:h-[70vh] my-12">
                {/* Image */}
                <div className="relative w-full md:w-1/2 h-[300px] md:h-full">
                  <Image
                    src="/images/single-image-2.jpg"
                    alt="Winter Collection"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
                    priority
                  />
                </div>

                <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-10 gap-6">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wide mb-2">
                      Classic Winter Collection
                    </h2>
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                      Discover timeless winter styles crafted for comfort and elegance.
                      Embrace the cold with fashion-forward warmth that blends tradition
                      with modern design.
                    </p>
                  </div>
                  <Link href="/users/Products">
                    <button className="bg-black text-white px-6 py-2 w-fit text-sm uppercase tracking-wide rounded-md hover:bg-gray-800 hover:scale-105 transition">
                      Shop Collection
                    </button>
                  </Link>
                </div>
              </section>
            )}
          </div>
        ))
      ) : (
        /* Fallback content when no sections are configured */
        <div className="text-center py-16 bg-gray-50 rounded-lg mx-10">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600 text-lg font-medium">No product sections configured yet</p>
          <p className="text-gray-500 mt-2">Admin can add product sections to showcase on the homepage</p>
          <Link href="/users/Products">
            <button className="mt-6 bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition">
              Browse All Products
            </button>
          </Link>
        </div>
      )}

      {/* Blog Section */}
      <BlogPost />

      {/* Brand Logos */}
      <div className="brands flex gap-10 justify-center w-screen h-auto px-6 py-10">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="relative w-[20%] h-full rounded-md overflow-hidden"
          >
            <Image
              src={`/images/logo${n}.png`}
              alt={`brand logo ${n}`}
              width={300}
              height={200}
              className="object-contain rounded-md"
            />
          </div>
        ))}
      </div>

      {/* Newsletter */}
      <NewsLetter />
    </div>
  );
};

export default Page;
