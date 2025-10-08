"use client";
import React, { useState } from "react";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import {
  FaRegArrowAltCircleLeft,
  FaRegArrowAltCircleRight,
} from "react-icons/fa";
import Link from "next/link";
import {
  addToWishlist,
  removeFromWishlist,
  addToCart,
  removeFromCart,
  updateWishlistInteraction,
  updateCartInteraction,
} from "../../lib/api";
import { getUserId, isAuthenticated } from "../../lib/auth";
import toast from "react-hot-toast";

const VISIBLE_CARDS = 4;

const ProductCard = ({ title, items }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [cartQuantities, setCartQuantities] = useState({});
  const [wishlist, setWishlist] = useState({});

  const handlePrev = () => {
    setStartIndex((prev) =>
      prev === 0 ? items.length - VISIBLE_CARDS : prev - 1
    );
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      prev + VISIBLE_CARDS >= items.length ? 0 : prev + 1
    );
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated()) {
      toast.error("Please login to add items to cart");
      return;
    }
    
    const userId = getUserId();
    const quantity = 1;
    try {
      const response = await addToCart(userId, productId, quantity);
      if (response.success) {
        setCartQuantities((prev) => ({
          ...prev,
          [productId]: (prev[productId] || 0) + quantity,
        }));
        
        // Track interaction
        await updateCartInteraction(userId, productId, true);
        
        toast.success("Added to cart!");
      }
    } catch (err) {
      toast.error("Failed to add to cart.");
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!isAuthenticated()) {
      toast.error("Please login to manage cart");
      return;
    }
    
    const userId = getUserId();
    try {
      const response = await removeFromCart(userId, productId);
      if (response.success) {
        setCartQuantities((prev) => {
          const updated = { ...prev };
          delete updated[productId];
          return updated;
        });
        toast.success("Removed from cart!");
      }
    } catch (err) {
      toast.error("Failed to remove from cart.");
    }
  };

  const handleIncreaseQuantity = async (productId) => {
    if (!isAuthenticated()) {
      toast.error("Please login to manage cart");
      return;
    }
    
    const userId = getUserId();
    try {
      const response = await addToCart(userId, productId, 1);
      if (response.success) {
        setCartQuantities((prev) => ({
          ...prev,
          [productId]: (prev[productId] || 0) + 1,
        }));
        toast.success("Quantity increased.");
      }
    } catch (err) {
      toast.error("Failed to update cart.");
    }
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated()) {
      toast.error("Please login to manage wishlist");
      return;
    }
    
    const userId = getUserId();
    try {
      if (wishlist[productId]) {
        const response = await removeFromWishlist(userId, productId);
        if (response.success) {
          setWishlist((prev) => {
            const updated = { ...prev };
            delete updated[productId];
            return updated;
          });
          
          // Track interaction
          await updateWishlistInteraction(userId, productId, false);
          
          toast.success("Removed from wishlist.");
        }
      } else {
        const response = await addToWishlist(userId, productId);
        if (response.success) {
          setWishlist((prev) => ({ ...prev, [productId]: true }));
          
          // Track interaction
          await updateWishlistInteraction(userId, productId, true);
          
          toast.success("Added to wishlist.");
        }
      }
    } catch (err) {
      toast.error("Failed to update wishlist.");
    }
  };

  if (!items || items.length === 0) return null;

  const visibleItems = items.slice(startIndex, startIndex + VISIBLE_CARDS);
  const slidesToShow =
    visibleItems.length < VISIBLE_CARDS
      ? [
          ...visibleItems,
          ...items.slice(0, VISIBLE_CARDS - visibleItems.length),
        ]
      : visibleItems;

  return (
    <div className="px-10 relative">
      {/* text */}
      <div className="flex justify-between text-black mb-6">
        <div className="text-xl font-bold">{title}</div>
        <Link href="/users/Products">
          <button className="text-sm underline font-semibold hover:scale-110">
            VIEW ALL PRODUCTS
          </button>
        </Link>
      </div>

      {/* Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-500">
        {slidesToShow.map((item, index) => {
          const productId = item.id || item._id;
          const quantity = cartQuantities[productId] || 0;
          const inWishlist = wishlist[productId] || false;

          return (
            <div
              key={index}
              className="flex flex-col items-start gap-4 h-[60vh] relative"
            >
              <div className="relative w-full h-[70%] rounded-md hover:scale-95 transition-transform">
                {item?.img && (
                  <img
                    src={`http://localhost:4001/upload/${
                      item.img.startsWith("/") ? "" : "/"
                    }${item.img}`}
                    alt={item.productname}
                    className="object-contain rounded-md w-full h-full"
                  />
                )}
              </div>
              
              <div className="text-black text-left flex flex-col gap-1 w-full">
                <h3 className="text-lg font-semibold uppercase">
                  {item.productname}
                </h3>
                <p className="text-sm">{item.price}</p>
                
                {/* Cart Controls */}
                {quantity > 0 ? (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleRemoveFromCart(productId)}
                      className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-black font-bold"
                    >
                      -
                    </button>
                    <span className="font-semibold">{quantity}</span>
                    <button
                      onClick={() => handleIncreaseQuantity(productId)}
                      className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-black font-bold"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToCart(productId)}
                    className="mt-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition uppercase text-sm tracking-wide w-full"
                  >
                    <FiShoppingCart className="inline mr-2" />
                    Add to Cart
                  </button>
                )}
              </div>
              
              {/* Wishlist Button */}
              <button 
                onClick={() => toggleWishlist(productId)}
                className={`absolute top-3 right-3 p-2 rounded-full transition ${
                  inWishlist 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-white/80 text-black hover:bg-gray-200'
                }`}
              >
                {inWishlist ? (
                  <FaHeart className="text-xl" />
                ) : (
                  <FiHeart className="text-xl" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-0 transform -translate-y-1/2 p-2 rounded-full z-10"
      >
        <FaRegArrowAltCircleLeft className="text-5xl text-black hover:text-blue-600" />
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-0 transform -translate-y-1/2 p-2 rounded-full z-10"
      >
        <FaRegArrowAltCircleRight className="text-5xl text-black hover:text-blue-600" />
      </button>
    </div>
  );
};

export default ProductCard;
