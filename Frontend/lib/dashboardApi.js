// Additional API functions for the admin dashboard
const API_BASE_URL = "http://localhost:4001";

// Get dashboard analytics data
export const getDashboardAnalytics = async (timeRange = '7d') => {
  const params = new URLSearchParams();
  params.append('timeRange', timeRange);
  params.append('_t', Date.now().toString());
  
  return await fetch(`${API_BASE_URL}/admin/analytics?${params}`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
  }).then((res) => res.json()).catch(() => ({ success: false }));
};

// Get user statistics
export const getUserStats = async () => {
  const params = new URLSearchParams();
  params.append('_t', Date.now().toString());
  
  return await fetch(`${API_BASE_URL}/admin/users/stats?${params}`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
  }).then((res) => res.json()).catch(() => ({ success: false }));
};

// Get product performance data
export const getProductPerformance = async (limit = 10) => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('_t', Date.now().toString());
  
  return await fetch(`${API_BASE_URL}/admin/products/performance?${params}`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
  }).then((res) => res.json()).catch(() => ({ success: false }));
};

// Get recent activities
export const getRecentActivities = async (limit = 20) => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('_t', Date.now().toString());
  
  return await fetch(`${API_BASE_URL}/admin/activities?${params}`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
  }).then((res) => res.json()).catch(() => ({ success: false }));
};

// Get low stock products
export const getLowStockProducts = async (threshold = 10) => {
  const params = new URLSearchParams();
  params.append('threshold', threshold.toString());
  params.append('_t', Date.now().toString());
  
  return await fetch(`${API_BASE_URL}/admin/products/low-stock?${params}`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
  }).then((res) => res.json()).catch(() => ({ success: false }));
};