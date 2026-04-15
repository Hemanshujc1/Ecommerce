// lib/api.js
import { API_BASE_URL } from "./api.config";

export const fetchSocialLinks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/social-links`);
      if (!res.ok) {
        throw new Error("Failed to fetch social links");
      }
      return await res.json();
    } catch (error) {
      console.error("Error fetching social links:", error);
      return null;
    }
};

// Product API functions
export const fetchAllProducts = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return null;
  }
};

export const fetchProductById = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!res.ok) {
      throw new Error("Failed to fetch product");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

export const updateProduct = async (id, formData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      body: formData,
    });
    if (!res.ok) {
      throw new Error("Failed to update product");
    }
    return await res.json();
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("Failed to delete product");
    }
    return await res.json();
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};
  
// Wishlist & Cart
export const addToWishlist = async (userId, productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/wishlist/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId }),
    });
    
    if (!response.ok) {
      throw new Error(`Wishlist add failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in addToWishlist:", error);
    return { success: false, error: error.message };
  }
};

export const removeFromWishlist = async (userId, productId) => {
  return await fetch(`${API_BASE_URL}/products/wishlist/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId }),
  }).then((res) => res.json());
};

export const addToCart = async (userId, productId, quantity) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId, quantity }),
    });
    
    if (!response.ok) {
      throw new Error(`Cart add failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in addToCart:", error);
    return { success: false, error: error.message };
  }
};

export const removeFromCart = async (userId, productId) => {
  return await fetch(`${API_BASE_URL}/products/cart/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId }),
  }).then((res) => res.json());
};

export const getUserCart = async (userId) => {
  return await fetch(`${API_BASE_URL}/products/cart/${userId}`).then((res) => res.json());
};

export const getUserWishlist = async (userId) => {
  return await fetch(`${API_BASE_URL}/products/wishlist/${userId}`).then((res) => res.json());
};

export const updateCartQuantity = async (userId, productId, quantity) => {
  return await fetch(`${API_BASE_URL}/products/cart/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId, quantity }),
  }).then((res) => res.json());
};

// Interactions
export const trackUserInteraction = async (userId, productId, isWishlisted = false, isInCart = false) => {
  return await fetch(`${API_BASE_URL}/interactions/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId, isWishlisted, isInCart }),
  }).then((res) => res.json());
};

export const updateWishlistInteraction = async (userId, productId, isWishlisted) => {
  return await fetch(`${API_BASE_URL}/interactions/wishlist/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId, isWishlisted }),
  }).then((res) => res.json());
};

export const updateCartInteraction = async (userId, productId, isInCart) => {
  return await fetch(`${API_BASE_URL}/interactions/cart/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId, isInCart }),
  }).then((res) => res.json());
};

export const getUserInteractions = async (userId) => {
  return await fetch(`${API_BASE_URL}/interactions/user/${userId}`).then((res) => res.json());
};

export const getPopularProducts = async (limit = 10) => {
  return await fetch(`${API_BASE_URL}/interactions/popular?limit=${limit}`).then((res) => res.json());
};

// Orders
export const createOrder = async (orderData) => {
  return await fetch(`${API_BASE_URL}/orders/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  }).then((res) => res.json());
};

export const getAllOrders = async (limit = 50, offset = 0, status = null) => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit);
  if (offset) params.append('offset', offset);
  if (status) params.append('status', status);
  
  return await fetch(`${API_BASE_URL}/orders/all?${params.toString()}`).then((res) => res.json());
};

export const getUserOrders = async (userId, limit = 20, offset = 0) => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit);
  if (offset) params.append('offset', offset);
  
  return await fetch(`${API_BASE_URL}/orders/user/${userId}?${params.toString()}`).then((res) => res.json());
};

export const getOrderById = async (orderId) => {
  return await fetch(`${API_BASE_URL}/orders/${orderId}`).then((res) => res.json());
};

export const updateOrderStatus = async (orderId, status, comment = '', changedBy = null) => {
  return await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, comment, changedBy }),
  }).then((res) => res.json());
};

export const cancelOrder = async (orderId, reason = '', userId = null) => {
  return await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason, userId }),
  }).then((res) => res.json());
};

export const createReturnExchangeRequest = async (requestData) => {
  return await fetch(`${API_BASE_URL}/orders/return-exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestData),
  }).then((res) => res.json());
};

export const getReturnExchangeRequests = async (userId = null, status = null) => {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (status) params.append('status', status);
  
  return await fetch(`${API_BASE_URL}/orders/return-exchange?${params.toString()}`).then((res) => res.json());
};

export const updateReturnExchangeStatus = async (requestId, status, adminComment = '', processedBy = null, refundAmount = null) => {
  return await fetch(`${API_BASE_URL}/orders/return-exchange/${requestId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, adminComment, processedBy, refundAmount }),
  }).then((res) => res.json());
};

export const getOrderStats = async () => {
  return await fetch(`${API_BASE_URL}/orders/stats/overview`).then((res) => res.json());
};
