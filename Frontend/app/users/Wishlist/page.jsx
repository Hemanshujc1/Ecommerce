"use client";

import React, { useEffect, useState } from "react";
import NewsLetter from "@/components/NewsLetter/NewsLetter";
import ProductCard from "@/components/ProductCard/ProductCard";
import WishlistCard from "@/components/WishlistCard/WishlistCard";

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

        let sections = [];
        if (data.sections) {
          if (typeof data.sections === "string") {
            sections = JSON.parse(data.sections);
          } else if (Array.isArray(data.sections)) {
            sections = data.sections;
          }
        }

        const transformed = sections.map((section) => ({
          title: section.sectionTitle || section.title || "Untitled Section",
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

  const handleWishlistUpdate = () => {
    setWishlistUpdateTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-12 bg-gray-50 text-black min-h-screen">
      <h1 className="text-4xl font-bold text-center uppercase tracking-widest py-16 bg-white">
        Your Wishlist
      </h1>

      <div className="container mx-auto">
        <WishlistCard onWishlistUpdate={handleWishlistUpdate} />
      </div>

      {/* Only show the first product section */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-gray-600 mt-4">Loading homepage sections...</p>
        </div>
      ) : error ? (
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
        <div>
          <ProductCard
            title={productSections[0].title}
            items={productSections[0].items}
          />
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg mx-10">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600 text-lg font-medium">
            No product sections configured yet
          </p>
          <p className="text-gray-500 mt-2">
            Admin can add product sections to showcase on the homepage
          </p>
          <Link href="/users/Products">
            <button className="mt-6 bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition">
              Browse All Products
            </button>
          </Link>
        </div>
      )}

      <NewsLetter />
    </div>
  );
};

export default Page;
