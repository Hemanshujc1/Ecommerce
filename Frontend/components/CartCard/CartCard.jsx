"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  getUserCart,
  removeFromCart,
  updateCartQuantity,
  addToWishlist,
} from "../../lib/api";
import { getUserId, isAuthenticated } from "../../lib/auth";
import toast from "react-hot-toast";

const CartCard = ({ onCartUpdate }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    if (!isAuthenticated()) {
      setLoading(false);
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
      toast.error("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (!isAuthenticated()) {
      toast.error("Please login to manage cart");
      return;
    }

    try {
      const userId = getUserId();
      const response = await updateCartQuantity(userId, productId, newQuantity);
      if (response.success) {
        if (newQuantity === 0) {
          setCartItems(prev => prev.filter(item => item.productId !== productId));
          toast.success("Item removed from cart");
        } else {
          setCartItems(prev => 
            prev.map(item => 
              item.productId === productId 
                ? { ...item, quantity: newQuantity }
                : item
            )
          );
          toast.success("Quantity updated");
        }
        if (onCartUpdate) onCartUpdate();
      }
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!isAuthenticated()) {
      toast.error("Please login to manage cart");
      return;
    }

    try {
      const userId = getUserId();
      const response = await removeFromCart(userId, productId);
      if (response.success) {
        setCartItems(prev => prev.filter(item => item.productId !== productId));
        toast.success("Item removed from cart");
        if (onCartUpdate) onCartUpdate();
      }
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleMoveToWishlist = async (productId) => {
    if (!isAuthenticated()) {
      toast.error("Please login to manage wishlist");
      return;
    }

    try {
      const userId = getUserId();
      // Add to wishlist
      const wishlistResponse = await addToWishlist(userId, productId);
      if (wishlistResponse.success) {
        // Remove from cart
        await handleRemoveFromCart(productId);
        toast.success("Item moved to wishlist");
      }
    } catch (error) {
      toast.error("Failed to move to wishlist");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading cart...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 text-lg">Please login to view your cart</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-10">
      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">Your cart is empty</p>
          <p className="text-gray-500 mt-2">Add some products to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => {
            const imageUrl = item.main_image 
              ? `http://localhost:4001/upload${item.main_image.startsWith('/') ? '' : '/'}${item.main_image}`
              : '/placeholder-image.jpg';

            return (
              <div
                key={item.productId}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Product Image */}
                  <div className="w-full md:w-32 h-32 flex-shrink-0">
                    <Image
                      width={128}
                      height={128}
                      src={imageUrl}
                      alt={item.product_name || "Product"}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div className="mb-2 md:mb-0">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.product_name}
                        </h3>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          ₹{item.price}
                        </p>
                        {item.discount && (
                          <p className="text-sm text-green-600">
                            {item.discount}% off
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-x border-gray-300 bg-gray-50 min-w-[50px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-lg font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleMoveToWishlist(item.productId)}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition"
                      >
                        Move to Wishlist
                      </button>
                      <button
                        onClick={() => handleRemoveFromCart(item.productId)}
                        className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition"
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

export default CartCard;
