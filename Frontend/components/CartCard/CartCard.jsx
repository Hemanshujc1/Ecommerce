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
import { getImageUrl } from "../../lib/image.helper";
import toast from "react-hot-toast";
import { IoHeartOutline, IoTrashOutline, IoAddOutline, IoRemoveOutline } from "react-icons/io5";

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
      if (response && response.statusCode === 200) {
        setCartItems(Array.isArray(response.data) ? response.data : []);
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
          setCartItems((prev) =>
            prev.filter((item) => item.productId !== productId),
          );
          toast.success("Item removed from cart");
        } else {
          setCartItems((prev) =>
            prev.map((item) =>
              item.productId === productId
                ? { ...item, quantity: newQuantity }
                : item,
            ),
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
        setCartItems((prev) =>
          prev.filter((item) => item.productId !== productId),
        );
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
      const wishlistResponse = await addToWishlist(userId, productId);
      if (wishlistResponse.success) {
        await handleRemoveFromCart(productId);
        toast.success("Item moved to wishlist");
      }
    } catch (error) {
      toast.error("Failed to move to wishlist");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <p className="text-sm text-gray-500 font-light">Loading cart...</p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-base font-light">Please login to view your cart</p>
      </div>
    );
  }

  return (
    <div>
      {cartItems.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-500 text-lg font-light">Your cart is empty</p>
          <p className="text-xs text-gray-400 mt-1">Add some products to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => {
            const imageUrl = getImageUrl(item.main_image);

            return (
              <div
                key={item.productId}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200"
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Product Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                    <Image
                      width={112}
                      height={112}
                      src={imageUrl}
                      alt={item.product_name || "Product"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-gray-900 leading-snug">
                          {item.product_name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-black text-gray-900">
                            ₹{item.price}
                          </p>
                          {item.discount > 0 && (
                            <span className="text-[10px] font-bold text-red-650 bg-red-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {item.discount}% off
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.productId,
                                item.quantity - 1,
                              )
                            }
                            className="p-2 hover:bg-gray-100 text-gray-500 hover:text-black transition"
                            disabled={item.quantity <= 1}
                          >
                            <IoRemoveOutline className="text-sm" />
                          </button>
                          <span className="px-4 py-1.5 text-xs font-bold text-gray-800 text-center min-w-[40px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.productId,
                                item.quantity + 1,
                              )
                            }
                            className="p-2 hover:bg-gray-100 text-gray-500 hover:text-black transition"
                          >
                            <IoAddOutline className="text-sm" />
                          </button>
                        </div>

                        <div className="text-base font-black text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleMoveToWishlist(item.productId)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
                      >
                        <IoHeartOutline className="text-sm" />
                        Move to Wishlist
                      </button>
                      <button
                        onClick={() => handleRemoveFromCart(item.productId)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
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

export default CartCard;
