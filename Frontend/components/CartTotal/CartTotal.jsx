"use client";
import React, { useEffect, useState } from "react";
import { getUserCart } from "../../lib/api";
import { getUserId, isAuthenticated } from "../../lib/auth";
import toast from "react-hot-toast";

const CartTotal = ({ cartItems }) => {
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });

  useEffect(() => {
    calculateTotals();
  }, [cartItems]);

  const calculateTotals = () => {
    if (!cartItems || cartItems.length === 0) {
      setTotals({
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      });
      return;
    }

    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const discount = cartItems.reduce((sum, item) => {
      if (item.discount) {
        const discountAmount = (item.price * item.quantity * item.discount) / 100;
        return sum + discountAmount;
      }
      return sum;
    }, 0);

    const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
    const tax = (subtotal - discount) * 0.18; // 18% GST
    const total = subtotal - discount + shipping + tax;

    setTotals({
      subtotal: subtotal,
      discount: discount,
      shipping: shipping,
      tax: tax,
      total: total,
    });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated()) {
      toast.error("Please login to proceed with checkout");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Redirect to checkout page
    window.location.href = '/users/Checkout';
  };

  const handleContinueShopping = () => {
    // Redirect to products page
    window.location.href = '/users/Products';
  };

  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm sticky top-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
      
      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({cartItems.length} items)</span>
          <span>₹{totals.subtotal.toFixed(2)}</span>
        </div>

        {/* Discount */}
        {totals.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-₹{totals.discount.toFixed(2)}</span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>
            {totals.shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `₹${totals.shipping.toFixed(2)}`
            )}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-gray-600">
          <span>Tax (GST 18%)</span>
          <span>₹{totals.tax.toFixed(2)}</span>
        </div>

        <hr className="border-gray-200" />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold text-gray-800">
          <span>Total</span>
          <span>₹{totals.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Free Shipping Message */}
      {totals.subtotal < 500 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            Add ₹{(500 - totals.subtotal).toFixed(2)} more for FREE shipping!
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <button
          onClick={handleBuyNow}
          className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition font-semibold uppercase tracking-wide"
        >
          Proceed to Checkout
        </button>
        
        <button
          onClick={handleContinueShopping}
          className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 transition font-semibold"
        >
          Continue Shopping
        </button>
      </div>

      {/* Security Badge */}
      <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Secure Checkout
      </div>
    </div>
  );
};

export default CartTotal;
