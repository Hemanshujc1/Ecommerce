// lib/image.helper.js
import { MEDIA_URL } from "./api.config";

/**
 * Resolves an image path from the backend to a fully qualified URL.
 * Standardizes paths by removing redundant prefixes and leading slashes.
 * 
 * @param {string} path - The raw path from the database (e.g. "products/img.jpg")
 * @returns {string} - The full URL (e.g. "http://localhost:4001/upload/products/img.jpg")
 */
export const getImageUrl = (path) => {
  if (!path) return "/images/product-placeholder.jpg"; // Fallback
  if (path.startsWith("http")) return path;

  // Remove leading slashes and redundant 'upload/' prefix if it exists in the stored path
  let cleanPath = path;
  while (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.slice(1);
  }
  
  if (cleanPath.startsWith("upload/")) {
    cleanPath = cleanPath.slice(7);
  }
  
  while (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.slice(1);
  }

  return `${MEDIA_URL}/${cleanPath}`;
};
