"use client";

import React, { useEffect, useState } from "react";
import NewsLetter from "@/components/NewsLetter/NewsLetter";
import ProductCard from "@/components/ProductCard/ProductCard";
import CartCard from "@/components/CartCard/CartCard";
import CartTotal from "@/components/CartTotal/CartTotal";
import { getUserCart } from "@/lib/api";
import { getUserId, isAuthenticated } from "@/lib/auth";

const Page = () => {
  const [productSections, setProductSections] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);

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

  useEffect(() => {
    loadCartItems();
  }, [cartUpdateTrigger]);

  const loadCartItems = async () => {
    if (!isAuthenticated()) {
      return;
    }

    try {
      const userId = getUserId();
      const response = await getUserCart(userId);
      if (response && response.success) {
        setCartItems(response.cart || []);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  const handleCartUpdate = () => {
    setCartUpdateTrigger(prev => prev + 1);
  };

  return (
    <div className="flex flex-col gap-12 bg-gray-50 text-black min-h-screen">
      <h1 className="text-4xl font-bold text-center uppercase tracking-widest py-16 bg-white">
        Your Cart
      </h1>

      <div className="container mx-auto px-4">
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Takes 2/3 of the space */}
            <div className="lg:col-span-2">
              <CartCard onCartUpdate={handleCartUpdate} />
            </div>
            
            {/* Cart Total - Takes 1/3 of the space */}
            <div className="lg:col-span-1">
              <CartTotal cartItems={cartItems} />
            </div>
          </div>
        ) : (
          <CartCard onCartUpdate={handleCartUpdate} />
        )}
      </div>

      {/* Related Products */}
      {productSections.map((section, idx) =>
        section.title === "You May Also Like" ? (
          <div key={`you-may-also-like-${idx}`} className="bg-white py-12">
            <ProductCard
              title={section.title}
              items={section.items}
            />
          </div>
        ) : null
      )}

      <NewsLetter />
    </div>
  );
};

export default Page;
