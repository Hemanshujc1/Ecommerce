"use client";
import React, { useState, useEffect } from "react";
import { getUserInteractions, getPopularProducts } from "../../lib/api";
import { getUserId, isAuthenticated } from "../../lib/auth";
import { getImageUrl } from "../../lib/image.helper";

const UserInteractionDashboard = () => {
  const [userInteractions, setUserInteractions] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = getUserId();

      const [interactionsResponse, popularResponse] = await Promise.all([
        getUserInteractions(userId),
        getPopularProducts(10),
      ]);

      if (interactionsResponse.success) {
        setUserInteractions(interactionsResponse.data || []);
      }

      if (popularResponse.success) {
        setPopularProducts(popularResponse.data || []);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-base font-light">
          Please login to view your interaction dashboard
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <p className="text-sm text-gray-500 font-light">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-650 text-sm font-medium">{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 bg-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      
      {/* User Interactions Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Your Recent Activity</h2>
          <p className="text-xs text-gray-500 font-light mt-1">Products you have interacted with or items saved in wishlist/cart.</p>
        </div>

        {userInteractions.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-500 text-sm font-light">No activity interactions recorded yet. Start browsing the collections!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {userInteractions.map((interaction) => (
              <div
                key={interaction.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Product Image */}
                  {interaction.main_image && (
                    <div className="aspect-video bg-gray-50 rounded-xl overflow-hidden mb-3 border border-gray-100">
                      <img
                        src={getImageUrl(interaction.main_image)}
                        alt={interaction.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1 leading-snug">
                      {interaction.product_name}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {interaction.brand}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-sm font-black text-gray-950">₹{interaction.price}</span>
                      {interaction.discount > 0 && (
                        <span className="text-[9px] font-bold text-red-650 bg-red-50 px-2 py-0.5 rounded-md">
                          -{interaction.discount}% Off
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Interaction Badges */}
                <div className="space-y-3 pt-2 border-t border-gray-50">
                  <div className="flex flex-wrap gap-1.5 text-[9px] font-bold uppercase tracking-wider">
                    {interaction.isWishlisted === 1 && (
                      <span className="bg-red-50 text-red-600 px-2 py-1 rounded-md">
                        ❤️ Saved
                      </span>
                    )}
                    {interaction.isInCart === 1 && (
                      <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                        🛒 Cart
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-455 font-light">
                    Interacted: {new Date(interaction.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Popular Products Section */}
      <section className="space-y-6 pt-4 border-t border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Popular Products</h2>
          <p className="text-xs text-gray-500 font-light mt-1">Trending products on the AURA platform based on community user engagement.</p>
        </div>

        {popularProducts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-500 text-sm font-light">No trending dashboard insights currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {popularProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Product Image */}
                  {product.main_image && (
                    <div className="aspect-video bg-gray-50 rounded-xl overflow-hidden mb-3 border border-gray-100">
                      <img
                        src={getImageUrl(product.main_image)}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1 leading-snug">
                      {product.product_name}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {product.brand}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-sm font-black text-gray-950">₹{product.price}</span>
                      {product.discount > 0 && (
                        <span className="text-[9px] font-bold text-red-650 bg-red-50 px-2 py-0.5 rounded-md">
                          -{product.discount}% Off
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Popularity Statistics */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-3 border-t border-gray-50">
                  <div className="bg-gray-50/50 rounded-xl p-2 border border-gray-100">
                    <div className="font-bold text-gray-900">
                      {product.interaction_count}
                    </div>
                    <div className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Views</div>
                  </div>
                  <div className="bg-red-50/20 rounded-xl p-2 border border-red-50/30">
                    <div className="font-bold text-red-600">
                      {product.wishlist_count}
                    </div>
                    <div className="text-[8px] text-red-400 font-bold uppercase tracking-wider mt-0.5">Likes</div>
                  </div>
                  <div className="bg-blue-50/20 rounded-xl p-2 border border-blue-50/30">
                    <div className="font-bold text-blue-600">
                      {product.cart_count}
                    </div>
                    <div className="text-[8px] text-blue-400 font-bold uppercase tracking-wider mt-0.5">Carts</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default UserInteractionDashboard;
