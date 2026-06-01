"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { addToCart, removeFromWishlist, getUserWishlist } from "../../lib/api";
import { getUserId, isAuthenticated } from "../../lib/auth";
import { getImageUrl } from "../../lib/image.helper";
import toast from "react-hot-toast";
import { IoCartOutline, IoTrashOutline, IoBagCheckOutline } from "react-icons/io5";

const WishlistCard = ({ onWishlistUpdate }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlistItems();
  }, []);

  const loadWishlistItems = async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      const userId = getUserId();
      const response = await getUserWishlist(userId);
      if (response && response.statusCode === 200) {
        setWishlistItems(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
      toast.error("Failed to load wishlist items");
    } finally {
      setLoading(false);
    }
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
        toast.success("Added to cart!");
      }
    } catch (err) {
      toast.error("Failed to add to cart.");
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    if (!isAuthenticated()) {
      toast.error("Please login to manage wishlist");
      return;
    }

    const userId = getUserId();
    try {
      const response = await removeFromWishlist(userId, productId);
      if (response.success) {
        setWishlistItems((prev) =>
          prev.filter((item) => item.productId !== productId),
        );
        toast.success("Removed from wishlist!");
        if (onWishlistUpdate) onWishlistUpdate();
      }
    } catch (err) {
      toast.error("Failed to remove from wishlist.");
    }
  };

  const handleBuyNow = (productId) => {
    handleAddToCart(productId);
    setTimeout(() => {
      window.location.href = "/users/Cart";
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <p className="text-sm text-gray-500 font-light">Loading wishlist...</p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-base font-light">Please login to view your wishlist</p>
      </div>
    );
  }

  return (
    <div>
      {wishlistItems.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-500 text-lg font-light">Your wishlist is empty</p>
          <p className="text-xs text-gray-400 mt-1">Add some products you love to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistItems.map((item) => {
            const imageUrl = getImageUrl(item.main_image);

            return (
              <div
                key={item.productId}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col group"
              >
                {/* Product Image Area */}
                <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
                  <Image
                    width={300}
                    height={300}
                    src={imageUrl}
                    alt={item.product_name || "Product"}
                    className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                  />
                  {item.discount > 0 && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold text-white bg-red-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      -{item.discount}% Off
                    </span>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-black transition">
                      {item.product_name}
                    </h3>
                    <p className="text-base font-black text-gray-900">
                      ₹{item.price}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="space-y-2 mt-auto pt-2">
                    <button
                      onClick={() => handleAddToCart(item.productId)}
                      className="w-full inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 transition active:scale-[0.98] shadow-sm"
                    >
                      <IoCartOutline className="text-base" />
                      Add to Cart
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBuyNow(item.productId)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-100 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition active:scale-[0.98]"
                      >
                        <IoBagCheckOutline className="text-sm" />
                        Buy Now
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.productId)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition active:scale-[0.98]"
                      >
                        <IoTrashOutline className="text-sm" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistCard;
