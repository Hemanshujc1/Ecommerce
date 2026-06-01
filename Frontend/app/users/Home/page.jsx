"use client";

import React, { useEffect, useState } from "react";
import LandingPage from "@/components/LandingPage/LandingPage";
import { API_BASE_URL } from "@/lib/api.config";
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
        const res = await fetch(`${API_BASE_URL}/home-products?t=${Date.now()}`, {
          cache: "no-store"
        });
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
              <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row h-auto md:h-[60vh] my-16 relative border border-white/5">
                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                
                {/* Image */}
                <div className="relative w-full md:w-1/2 h-[300px] md:h-full overflow-hidden bg-gray-900">
                  <Image
                    src="/images/single-image-2.jpg"
                    alt="Winter Collection"
                    fill
                    className="object-cover rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none transition-transform duration-700 hover:scale-105"
                    priority
                  />
                </div>

                <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-12 py-10 md:py-0 gap-6 relative z-10">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-2 block">New Season</span>
                    <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-4 leading-tight">
                      Classic Winter Collection
                    </h2>
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                      Discover timeless winter styles crafted for comfort and elegance.
                      Embrace the cold with fashion-forward warmth that blends tradition
                      with modern design.
                    </p>
                  </div>
                  <Link href="/users/Products">
                    <button className="bg-white text-black px-8 py-3.5 w-fit text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-100 hover:scale-105 active:scale-98 transition-all duration-300 shadow-lg">
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
      <div className="brands flex flex-wrap gap-4 justify-center w-full px-6 py-10">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="relative w-1/3 sm:w-1/4 md:w-1/5 lg:w-[15%] h-20 rounded-md overflow-hidden">
            <Image
              src={`/images/logo${n}.png`}
              alt={`brand logo ${n}`}
              width={300}
              height={200}
              className="object-contain rounded-md w-full h-full"
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
