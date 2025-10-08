"use client";
import React, { useEffect, useState } from "react";
import NewsLetter from "@/components/NewsLetter/NewsLetter";
import DisplayProduct from "@/components/DisplayProduct/DisplayProduct";
import ProductCard from "@/components/ProductCard/ProductCard";


const page = () => {
  const [productSections, setProductSections] = useState([]);

  useEffect(() => {
    const fetchProductSections = async () => {
      try {
        const res = await fetch("http://localhost:4001/home-products");
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
      <h1 className="text-4xl font-bold text-center uppercase tracking-widest px-10 py-12">
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
