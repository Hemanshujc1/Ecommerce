"use client";
import React, { useEffect, useState } from "react";
import NewsLetter from "@/components/NewsLetter/NewsLetter";
import DisplayProduct from "@/components/DisplayProduct/DisplayProduct";
import ProductCard from "@/components/ProductCard/ProductCard";
import { API_BASE_URL } from "@/lib/api.config";


const page = () => {
  const [productSections, setProductSections] = useState([]);

  useEffect(() => {
    const fetchProductSections = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/home-products?t=${Date.now()}`, {
          cache: "no-store"
        });
        const data = await res.json();

        const transformed = (data.sections || []).map((section) => ({
          title: section.sectionTitle,
          items: section.products,
        }));

        setProductSections(transformed);
      } catch (error) {
        console.error("Failed to fetch product sections", error);
      }
    };

    fetchProductSections();
  }, []);
  return (
    <div className="flex flex-col gap-12 text-black">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center uppercase tracking-widest px-4 py-8 sm:py-12">
        All Products
      </h1>
      <DisplayProduct />
      {/* Related Products */}
      {productSections.map((section, idx) =>
        section.title === "You May Also Like" ? (
          <ProductCard
            key={`you-may-also-like-${idx}`}
            title={section.title}
            items={section.items}
          />
        ) : null
      )}
      <NewsLetter/>
    </div>
  );
};

export default page;
