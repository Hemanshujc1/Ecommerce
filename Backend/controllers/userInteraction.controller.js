// controllers/userInteraction.controller.js
const UserInteractionService = require("../services/userInteraction.service");

const UserInteractionController = {
  // Track user interaction with product
  trackInteraction: async (req, res) => {
    try {
      const { userId, productId, isWishlisted, isInCart } = req.body;
      
      if (!userId || !productId) {
        return res.status(400).json({ 
          success: false, 
          error: "User ID and Product ID are required" 
        });
      }

      const result = await UserInteractionService.trackInteraction(
        userId, 
        productId, 
        isWishlisted || false, 
        isInCart || false
      );

      res.status(200).json({
        success: true,
        message: "Interaction tracked successfully",
        data: result
      });
    } catch (err) {
      console.error("Error tracking interaction:", err);
      res.status(500).json({
        success: false,
        error: "Failed to track interaction",
        details: err.message
      });
    }
  },

  // Update wishlist status
  updateWishlistStatus: async (req, res) => {
    try {
      const { userId, productId, isWishlisted } = req.body;
      
      if (!userId || !productId || isWishlisted === undefined) {
        return res.status(400).json({ 
          success: false, 
          error: "User ID, Product ID, and wishlist status are required" 
        });
      }

      const result = await UserInteractionService.updateWishlistStatus(
        userId, 
        productId, 
        isWishlisted
      );

      res.status(200).json({
        success: true,
        message: "Wishlist status updated successfully",
        data: result
      });
    } catch (err) {
      console.error("Error updating wishlist status:", err);
      res.status(500).json({
        success: false,
        error: "Failed to update wishlist status",
        details: err.message
      });
    }
  },

  // Update cart status
  updateCartStatus: async (req, res) => {
    try {
      const { userId, productId, isInCart } = req.body;
      
      if (!userId || !productId || isInCart === undefined) {
        return res.status(400).json({ 
          success: false, 
          error: "User ID, Product ID, and cart status are required" 
        });
      }

      const result = await UserInteractionService.updateCartStatus(
        userId, 
        productId, 
        isInCart
      );

      res.status(200).json({
        success: true,
        message: "Cart status updated successfully",
        data: result
      });
    } catch (err) {
      console.error("Error updating cart status:", err);
      res.status(500).json({
        success: false,
        error: "Failed to update cart status",
        details: err.message
      });
    }
  },

  // Get user interactions
  getUserInteractions: async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: "User ID is required" 
        });
      }

      const interactions = await UserInteractionService.getUserInteractions(userId);

      res.status(200).json({
        success: true,
        data: interactions
      });
    } catch (err) {
      console.error("Error fetching user interactions:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch user interactions",
        details: err.message
      });
    }
  },

  // Get product interaction stats
  getProductStats: async (req, res) => {
    try {
      const { productId } = req.params;
      
      if (!productId) {
        return res.status(400).json({ 
          success: false, 
          error: "Product ID is required" 
        });
      }

      const stats = await UserInteractionService.getProductStats(productId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err) {
      console.error("Error fetching product stats:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch product stats",
        details: err.message
      });
    }
  },

  // Get popular products
  getPopularProducts: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const products = await UserInteractionService.getPopularProducts(limit);

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (err) {
      console.error("Error fetching popular products:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch popular products",
        details: err.message
      });
    }
  },

  // Get user wishlist with interaction data
  getUserWishlistWithInteractions: async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: "User ID is required" 
        });
      }

      const wishlist = await UserInteractionService.getUserWishlist(userId);

      res.status(200).json({
        success: true,
        wishlist: wishlist
      });
    } catch (err) {
      console.error("Error fetching user wishlist:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch user wishlist",
        details: err.message
      });
    }
  },

  // Get user cart with interaction data
  getUserCartWithInteractions: async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: "User ID is required" 
        });
      }

      const cart = await UserInteractionService.getUserCart(userId);

      res.status(200).json({
        success: true,
        cart: cart
      });
    } catch (err) {
      console.error("Error fetching user cart:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch user cart",
        details: err.message
      });
    }
  },

  // Remove interaction
  removeInteraction: async (req, res) => {
    try {
      const { userId, productId } = req.body;
      
      if (!userId || !productId) {
        return res.status(400).json({ 
          success: false, 
          error: "User ID and Product ID are required" 
        });
      }

      const result = await UserInteractionService.removeInteraction(userId, productId);

      res.status(200).json({
        success: true,
        message: "Interaction removed successfully",
        data: result
      });
    } catch (err) {
      console.error("Error removing interaction:", err);
      res.status(500).json({
        success: false,
        error: "Failed to remove interaction",
        details: err.message
      });
    }
  }
};

module.exports = UserInteractionController;