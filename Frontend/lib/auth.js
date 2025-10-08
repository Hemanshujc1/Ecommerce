// lib/auth.js
export const getUserId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId') || sessionStorage.getItem('userId') || '1'; // Default user ID for testing
  }
  return '1'; // Default user ID for testing
};

export const setUserId = (userId) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userId', userId);
  }
};

export const removeUserId = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userId');
    sessionStorage.removeItem('userId');
  }
};

export const isAuthenticated = () => {
  return true; // Always authenticated for testing with default user ID
};