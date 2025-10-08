// services/userInteraction.service.js
const UserInteractionModel = require("../models/userInteraction.model");

const UserInteractionService = {
  trackInteraction: async (userId, productId, isWishlisted, isInCart) => {
    return await UserInteractionModel.trackInteraction(userId, productId, isWishlisted, isInCart);
  },

  updateWishlistStatus: async (userId, productId, isWishlisted) => {
    return await UserInteractionModel.updateWishlistStatus(userId, productId, isWishlisted);
  },

  updateCartStatus: async (userId, productId, isInCart) => {
    return await UserInteractionModel.updateCartStatus(userId, productId, isInCart);
  },

  getUserInteractions: async (userId) => {
    return await UserInteractionModel.getUserInteractions(userId);
  },

  getProductStats: async (productId) => {
    return await UserInteractionModel.getProductStats(productId);
  },

  getPopularProducts: async (limit) => {
    return await UserInteractionModel.getPopularProducts(limit);
  },

  getUserWishlist: async (userId) => {
    return await UserInteractionModel.getUserWishlist(userId);
  },

  getUserCart: async (userId) => {
    return await UserInteractionModel.getUserCart(userId);
  },

  removeInteraction: async (userId, productId) => {
    return await UserInteractionModel.removeInteraction(userId, productId);
  }
};

module.exports = UserInteractionService;