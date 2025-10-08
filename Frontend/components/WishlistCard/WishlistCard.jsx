"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  addToCart,
  removeFromWishlist,
  getUserWishlist,
} from "../../lib/api";
import { getUserId, isAuthenticated } from "../../lib/auth";
import toast from "react-hot-toast";

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
      if (response && response.success) {
        setWishlistItems(response.wishlist || []);
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
        setWishlistItems(prev => prev.filter(item => item.productId !== productId));
        toast.success("Removed from wishlist!");
        if (onWishlistUpdate) onWishlistUpdate();
      }
    } catch (err) {
      toast.error("Failed to remove from wishlist.");
    }
  };

  const handleBuyNow = (productId) => {
    // Add to cart first, then redirect to checkout
    handleAddToCart(productId);
    setTimeout(() => {
      window.location.href = '/users/Cart';
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading wishlist...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 text-lg">Please login to view your wishlist</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-10">
      {wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">Your wishlist is empty</p>
          <p className="text-gray-500 mt-2">Add some products you love!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const imageUrl = item.main_image 
              ? `http://localhost:4001/upload${item.main_image.startsWith('/') ? '' : '/'}${item.main_image}`
              : '/placeholder-image.jpg';

            return (
              <div
                key={item.productId}
                className="bg-white text-black rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative w-full h-[250px]">
                  <Image
                    width={300}
                    height={250}
                    src={imageUrl}
                    alt={item.product_name || "Product"}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">
                    {item.product_name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-gray-900">
                      ₹{item.price}
                    </p>
                    {item.discount && (
                      <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                        {item.discount}% off
                      </span>
                    )}
                  </div>
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm text-gray-600">{item.rating}/5</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-2 mt-2">
                    <button 
                      onClick={() => handleAddToCart(item.productId)}
                      className="w-full bg-black text-white px-4 py-2 text-sm uppercase rounded hover:bg-gray-800 transition font-semibold"
                    >
                      Add to Cart
                    </button>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleBuyNow(item.productId)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 text-sm uppercase rounded hover:bg-blue-700 transition font-semibold"
                      >
                        Buy Now
                      </button>
                      <button 
                        onClick={() => handleRemoveFromWishlist(item.productId)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 text-sm uppercase rounded hover:bg-red-700 transition font-semibold"
                      >
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
