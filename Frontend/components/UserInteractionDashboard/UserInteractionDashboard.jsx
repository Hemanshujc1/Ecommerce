"use client";
import React, { useState, useEffect } from "react";
import { getUserInteractions, getPopularProducts } from "../../lib/api";
import { getUserId, isAuthenticated } from "../../lib/auth";

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
      
      // Load user interactions and popular products in parallel
      const [interactionsResponse, popularResponse] = await Promise.all([
        getUserInteractions(userId),
        getPopularProducts(10)
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
        <p className="text-gray-600 text-lg">Please login to view your interaction dashboard</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="text-gray-600 ml-4">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 text-lg">{error}</p>
        <button 
          onClick={loadDashboardData}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Product Interactions</h1>

      {/* User Interactions Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Your Recent Interactions</h2>
        {userInteractions.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No interactions yet. Start browsing products!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userInteractions.map((interaction) => (
              <div
                key={interaction.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                {/* Product Image */}
                {interaction.main_image && (
                  <div className="w-full h-32 bg-gray-100 rounded overflow-hidden mb-3">
                    <img
                      src={`http://localhost:4001/upload${interaction.main_image.startsWith('/') ? '' : '/'}${interaction.main_image}`}
                      alt={interaction.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {interaction.product_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{interaction.brand}</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{interaction.price}
                  </p>
                  {interaction.discount > 0 && (
                    <span className="text-sm text-orange-600">
                      {interaction.discount}% off
                    </span>
                  )}
                </div>

                {/* Interaction Status */}
                <div className="flex gap-2">
                  {interaction.isWishlisted === 1 && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      ❤️ Wishlisted
                    </span>
                  )}
                  {interaction.isInCart === 1 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      🛒 In Cart
                    </span>
                  )}
                </div>

                {/* Interaction Date */}
                <div className="mt-2 text-xs text-gray-500">
                  Last updated: {new Date(interaction.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular Products Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Popular Products</h2>
        {popularProducts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No popular products data available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                {/* Product Image */}
                {product.main_image && (
                  <div className="w-full h-32 bg-gray-100 rounded overflow-hidden mb-3">
                    <img
                      src={`http://localhost:4001/upload${product.main_image.startsWith('/') ? '' : '/'}${product.main_image}`}
                      alt={product.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {product.product_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{product.price}
                  </p>
                  {product.discount > 0 && (
                    <span className="text-sm text-orange-600">
                      {product.discount}% off
                    </span>
                  )}
                </div>

                {/* Popularity Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-sm font-semibold">{product.interaction_count}</div>
                    <div className="text-xs text-gray-600">Interactions</div>
                  </div>
                  <div className="bg-red-50 rounded p-2">
                    <div className="text-sm font-semibold">{product.wishlist_count}</div>
                    <div className="text-xs text-gray-600">Wishlisted</div>
                  </div>
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-sm font-semibold">{product.cart_count}</div>
                    <div className="text-xs text-gray-600">In Cart</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInteractionDashboard;