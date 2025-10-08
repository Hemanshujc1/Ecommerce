// lib/api.js
const API_BASE_URL = "http://localhost:4001";

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
  
// lib/api.js
export const addToWishlist = async (userId, productId) => {
  try {
    console.log('API: Adding to wishlist with data:', { userId, productId });
    
    const response = await fetch("http://localhost:4001/products/wishlist/add", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ userId, productId }),
    });
    
    console.log('API: Wishlist response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Wishlist error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Wishlist success response:', result);
    return result;
  } catch (error) {
    console.error("Error in addToWishlist:", error);
    return { success: false, error: error.message };
  }
};

export const removeFromWishlist = async (userId, productId) => {
  return await fetch("http://localhost:4001/products/wishlist/remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId }),
  }).then((res) => res.json());
};

export const addToCart = async (userId, productId, quantity) => {
  try {
    console.log('API: Adding to cart with data:', { userId, productId, quantity });
    
    const response = await fetch("http://localhost:4001/products/cart/add", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ userId, productId, quantity }),
    });
    
    console.log('API: Cart response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Cart error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Cart success response:', result);
    return result;
  } catch (error) {
    console.error("Error in addToCart:", error);
    return { success: false, error: error.message };
  }
};

export const removeFromCart = async (userId, productId) => {
  return await fetch("http://localhost:4001/products/cart/remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId }),
  }).then((res) => res.json());
};

// Get user's cart items
export const getUserCart = async (userId) => {
  return await fetch(`http://localhost:4001/products/cart/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
};

// Get user's wishlist items
export const getUserWishlist = async (userId) => {
  return await fetch(`http://localhost:4001/products/wishlist/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
};

// Update cart quantity with stock validation
export const updateCartQuantity = async (userId, productId, quantity) => {
  return await fetch("http://localhost:4001/products/cart/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId, quantity }),
  }).then((res) => res.json());
};

// User Interaction API functions
export const trackUserInteraction = async (userId, productId, isWishlisted = false, isInCart = false) => {
  return await fetch("http://localhost:4001/interactions/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId, isWishlisted, isInCart }),
  }).then((res) => res.json());
};

export const updateWishlistInteraction = async (userId, productId, isWishlisted) => {
  return await fetch("http://localhost:4001/interactions/wishlist/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId, isWishlisted }),
  }).then((res) => res.json());
};

export const updateCartInteraction = async (userId, productId, isInCart) => {
  return await fetch("http://localhost:4001/interactions/cart/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId, isInCart }),
  }).then((res) => res.json());
};

export const getUserInteractions = async (userId) => {
  return await fetch(`http://localhost:4001/interactions/user/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
};

export const getProductStats = async (productId) => {
  return await fetch(`http://localhost:4001/interactions/product/${productId}/stats`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
};

export const getPopularProducts = async (limit = 10) => {
  return await fetch(`http://localhost:4001/interactions/popular?limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
};

export const getUserWishlistWithInteractions = async (userId) => {
  return await fetch(`http://localhost:4001/interactions/user/${userId}/wishlist`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
};

export const getUserCartWithInteractions = async (userId) => {
  return await fetch(`http://localhost:4001/interactions/user/${userId}/cart`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
};

// Order Management API functions
export const createOrder = async (orderData) => {
  return await fetch("http://localhost:4001/orders/create", {
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
  // Add cache-busting parameter
  params.append('_t', Date.now().toString());
  
  return await fetch(`http://localhost:4001/orders/all?${params}`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
  }).then((res) => res.json());
};

export const getUserOrders = async (userId, limit = 20, offset = 0) => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit);
  if (offset) params.append('offset', offset);
  
  return await fetch(`http://localhost:4001/orders/user/${userId}?${params}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
};

export const getOrderById = async (orderId) => {
  return await fetch(`http://localhost:4001/orders/${orderId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
};

export const updateOrderStatus = async (orderId, status, comment = '', changedBy = null) => {
  return await fetch(`http://localhost:4001/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, comment, changedBy }),
  }).then((res) => res.json());
};

export const cancelOrder = async (orderId, reason = '', userId = null) => {
  return await fetch(`http://localhost:4001/orders/${orderId}/cancel`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason, userId }),
  }).then((res) => res.json());
};

export const createReturnExchangeRequest = async (requestData) => {
  return await fetch("http://localhost:4001/orders/return-exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestData),
  }).then((res) => res.json());
};

export const getReturnExchangeRequests = async (userId = null, status = null) => {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (status) params.append('status', status);
  // Add cache-busting parameter
  params.append('_t', Date.now().toString());
  
  return await fetch(`http://localhost:4001/orders/return-exchange?${params}`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
  }).then((res) => res.json());
};

export const updateReturnExchangeStatus = async (requestId, status, adminComment = '', processedBy = null, refundAmount = null) => {
  return await fetch(`http://localhost:4001/orders/return-exchange/${requestId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, adminComment, processedBy, refundAmount }),
  }).then((res) => res.json());
};

export const getOrderStats = async () => {
  return await fetch("http://localhost:4001/orders/stats/overview", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
};
