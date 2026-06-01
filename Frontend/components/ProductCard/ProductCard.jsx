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
import { getImageUrl } from "../../lib/image.helper";
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
    <div className="px-4 sm:px-6 lg:px-10 relative max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center text-black mb-6">
        <div className="flex items-center gap-4">
          <div className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 uppercase">{title}</div>
          <Link href="/users/Products">
            <button className="text-xs text-gray-400 hover:text-black hover:underline font-bold uppercase tracking-widest transition">VIEW ALL</button>
          </Link>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm active:scale-90"
            aria-label="Previous slide"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm active:scale-90"
            aria-label="Next slide"
          >
            →
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 transition-all duration-500">
        {slidesToShow.map((item, index) => {
          const productId = item.id || item._id;
          const quantity = cartQuantities[productId] || 0;
          const inWishlist = wishlist[productId] || false;

          return (
            <div key={index} className="flex flex-col items-start gap-3 relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-4 border border-gray-100 group w-full">
              <Link href={`/users/Productdisplay/${productId}`} className="w-full">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden cursor-pointer bg-gray-50 flex items-center justify-center p-2">
                  {(item?.img || item?.main_image || item?.mainImage || item?.image) && (
                    <img
                      src={getImageUrl(item.img || item.main_image || item.mainImage || item.image)}
                      alt={item.productname || item.product_name || item.name || "Product"}
                      className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
              </Link>

              <div className="text-black text-left flex flex-col gap-1 w-full mt-2">
                <Link href={`/users/Productdisplay/${productId}`}>
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 uppercase line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer">
                    {item.productname || item.product_name || item.name || "Product"}
                  </h3>
                </Link>
                 <div className="flex items-center gap-2 mt-1">
                  <span className="text-red-600 font-extrabold text-base sm:text-lg">
                    {typeof item.price === "string" ? item.price : `₹${item.price}`}
                  </span>
                  {item.discount > 0 && (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      -{Math.round(item.discount)}%
                    </span>
                  )}
                </div>

                {quantity > 0 ? (
                  <div className="flex items-center justify-between gap-2 mt-3 bg-gray-50 rounded-xl p-1 border w-full">
                    <button onClick={() => handleRemoveFromCart(productId)} className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg hover:bg-gray-100 text-black font-bold transition">-</button>
                    <span className="font-semibold text-sm">{quantity}</span>
                    <button onClick={() => handleIncreaseQuantity(productId)} className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg hover:bg-gray-100 text-black font-bold transition">+</button>
                  </div>
                ) : (
                  <button onClick={() => handleAddToCart(productId)} className="mt-3 bg-black text-white py-2.5 rounded-xl hover:bg-gray-800 transition uppercase text-xs font-bold tracking-wider w-full active:scale-[0.98] shadow-sm">
                    Add to Cart
                  </button>
                )}
              </div>

              <button
                onClick={() => toggleWishlist(productId)}
                className={`absolute top-6 right-6 p-2 rounded-full shadow-sm transition ${inWishlist ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/90 text-gray-600 hover:text-black hover:bg-white'}`}
              >
                {inWishlist ? <FaHeart className="text-base" /> : <FiHeart className="text-base" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductCard;
