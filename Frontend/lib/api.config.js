// lib/api.config.js
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

// Asset base URLs
export const MEDIA_URL = `${API_BASE_URL}/upload`;
export const PRODUCT_IMAGE_URL = `${API_BASE_URL}/upload`; // Standardized to use /upload
export const BLOG_IMAGE_URL = `${API_BASE_URL}/upload`;
