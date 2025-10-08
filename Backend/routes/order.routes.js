// routes/order.routes.js
const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/order.controller");

// Order routes
router.post("/create", OrderController.createOrder);
router.get("/all", OrderController.getAllOrders);
router.get("/user/:userId", OrderController.getUserOrders);

// Return/Exchange routes (must come before /:orderId route)
router.post("/return-exchange", OrderController.createReturnExchangeRequest);
router.get("/return-exchange", OrderController.getReturnExchangeRequests);
router.put("/return-exchange/:requestId", OrderController.updateReturnExchangeStatus);

// Statistics (must come before /:orderId route)
router.get("/stats/overview", OrderController.getOrderStats);

// Order-specific routes (must come last due to /:orderId wildcard)
router.get("/:orderId", OrderController.getOrderById);
router.put("/:orderId/status", OrderController.updateOrderStatus);
router.put("/:orderId/cancel", OrderController.cancelOrder);

module.exports = router;