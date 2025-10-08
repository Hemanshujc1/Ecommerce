"use client";
import React, { useState, useEffect } from "react";
import { getUserCart, createOrder } from "../../lib/api";
import { getUserId, isAuthenticated } from "../../lib/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India"
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderTotals, setOrderTotals] = useState({
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });

  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      loadCartItems();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [cartItems]);

  const loadCartItems = async () => {
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

  const calculateTotals = () => {
    if (!cartItems || cartItems.length === 0) {
      setOrderTotals({ subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 });
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

    const shipping = subtotal > 500 ? 0 : 50;
    const tax = (subtotal - discount) * 0.18;
    const total = subtotal - discount + shipping + tax;

    setOrderTotals({
      subtotal: subtotal,
      discount: discount,
      shipping: shipping,
      tax: tax,
      total: total
    });
  };

  const handleAddressChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.addressLine1 || 
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
      toast.error("Please fill in all required address fields");
      return false;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setOrderLoading(true);
    try {
      const userId = getUserId();
      
      // Prepare order data
      const orderData = {
        userId: userId,
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.product_name,
          productImage: item.main_image,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          size: item.size || '',
          color: item.color || ''
        })),
        totalAmount: orderTotals.subtotal,
        discountAmount: orderTotals.discount,
        shippingAmount: orderTotals.shipping,
        taxAmount: orderTotals.tax,
        finalAmount: orderTotals.total,
        paymentMethod: paymentMethod,
        shippingAddress: shippingAddress,
        billingAddress: shippingAddress,
        phone: shippingAddress.phone,
        email: "user@example.com", // You might want to get this from user profile
        notes: ""
      };

      const response = await createOrder(orderData);

      if (response.success) {
        toast.success("Order placed successfully!");
        
        // Simulate payment processing
        setTimeout(() => {
          router.push(`/users/Account?tab=orders&orderId=${response.data.orderId}`);
        }, 2000);
      } else {
        toast.error(response.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order");
    } finally {
      setOrderLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 text-lg">Please login to proceed with checkout</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="text-gray-600 ml-4">Loading checkout...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 text-lg">Your cart is empty</p>
        <button 
          onClick={() => router.push('/users/Products')}
          className="mt-4 bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Forms */}
        <div className="space-y-8">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={shippingAddress.name}
                onChange={(e) => handleAddressChange('name', e.target.value)}
                className="p-3 border rounded-md"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number *"
                value={shippingAddress.phone}
                onChange={(e) => handleAddressChange('phone', e.target.value)}
                className="p-3 border rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Address Line 1 *"
                value={shippingAddress.addressLine1}
                onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                className="p-3 border rounded-md md:col-span-2"
                required
              />
              <input
                type="text"
                placeholder="Address Line 2"
                value={shippingAddress.addressLine2}
                onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                className="p-3 border rounded-md md:col-span-2"
              />
              <input
                type="text"
                placeholder="City *"
                value={shippingAddress.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="p-3 border rounded-md"
                required
              />
              <input
                type="text"
                placeholder="State *"
                value={shippingAddress.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="p-3 border rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Postal Code *"
                value={shippingAddress.postalCode}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                className="p-3 border rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Country"
                value={shippingAddress.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="p-3 border rounded-md"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span>Cash on Delivery (COD)</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span>Credit/Debit Card</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span>UPI Payment</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="payment"
                  value="wallet"
                  checked={paymentMethod === "wallet"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span>Digital Wallet</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-white p-6 rounded-lg border h-fit sticky top-4">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          {/* Cart Items */}
          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <img
                  src={`http://localhost:4001/upload${item.main_image?.startsWith('/') ? '' : '/'}${item.main_image}`}
                  alt={item.product_name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.product_name}</h4>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{orderTotals.subtotal.toFixed(2)}</span>
            </div>
            {orderTotals.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{orderTotals.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{orderTotals.shipping === 0 ? 'FREE' : `₹${orderTotals.shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (GST 18%)</span>
              <span>₹{orderTotals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span>₹{orderTotals.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={orderLoading}
            className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition font-semibold mt-6 disabled:opacity-50"
          >
            {orderLoading ? "Placing Order..." : `Place Order - ₹${orderTotals.total.toFixed(2)}`}
          </button>

          {/* Security Badge */}
          <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure Checkout
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;