// routes/userInteraction.routes.js
const express = require("express");
const router = express.Router();
const UserInteractionController = require("../controllers/userInteraction.controller");

// Track user interaction with product
router.post("/track", UserInteractionController.trackInteraction);

// Update wishlist status
router.post("/wishlist/update", UserInteractionController.updateWishlistStatus);

// Update cart status
router.post("/cart/update", UserInteractionController.updateCartStatus);

// Get user interactions
router.get("/user/:userId", UserInteractionController.getUserInteractions);

// Get product interaction stats
router.get("/product/:productId/stats", UserInteractionController.getProductStats);

// Get popular products based on interactions
router.get("/popular", UserInteractionController.getPopularProducts);

// Get user wishlist with interaction data
router.get("/user/:userId/wishlist", UserInteractionController.getUserWishlistWithInteractions);

// Get user cart with interaction data
router.get("/user/:userId/cart", UserInteractionController.getUserCartWithInteractions);

// Remove interaction
router.delete("/remove", UserInteractionController.removeInteraction);

module.exports = router;