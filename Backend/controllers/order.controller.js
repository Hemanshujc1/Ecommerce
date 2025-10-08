// controllers/order.controller.js
const OrderService = require("../services/order.service");

const OrderController = {
  // Create new order (checkout)
  createOrder: async (req, res) => {
    try {
      const orderData = req.body;
      
      // Validate required fields
      if (!orderData.userId || !orderData.items || !orderData.shippingAddress) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: userId, items, or shippingAddress"
        });
      }

      // Calculate estimated delivery date (7 days from now)
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
      orderData.estimatedDeliveryDate = estimatedDelivery;

      const result = await OrderService.createOrder(orderData);

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: result
      });
    } catch (err) {
      console.error("Error creating order:", err);
      res.status(500).json({
        success: false,
        error: "Failed to create order",
        details: err.message
      });
    }
  },

  // Get all orders (admin)
  getAllOrders: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const status = req.query.status || null;

      const orders = await OrderService.getAllOrders(limit, offset, status);

      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch orders",
        details: err.message
      });
    }
  },

  // Get user orders
  getUserOrders: async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required"
        });
      }

      const orders = await OrderService.getUserOrders(userId, limit, offset);

      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (err) {
      console.error("Error fetching user orders:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch user orders",
        details: err.message
      });
    }
  },

  // Get order by ID
  getOrderById: async (req, res) => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: "Order ID is required"
        });
      }

      const order = await OrderService.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Order not found"
        });
      }

      res.status(200).json({
        success: true,
        data: order
      });
    } catch (err) {
      console.error("Error fetching order:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch order",
        details: err.message
      });
    }
  },

  // Update order status (admin)
  updateOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, comment, changedBy } = req.body;

      if (!orderId || !status) {
        return res.status(400).json({
          success: false,
          error: "Order ID and status are required"
        });
      }

      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status"
        });
      }

      const result = await OrderService.updateOrderStatus(orderId, status, comment, changedBy);

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: result
      });
    } catch (err) {
      console.error("Error updating order status:", err);
      res.status(500).json({
        success: false,
        error: "Failed to update order status",
        details: err.message
      });
    }
  },

  // Cancel order
  cancelOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { reason, userId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: "Order ID is required"
        });
      }

      const result = await OrderService.cancelOrder(orderId, reason, userId);

      res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        data: result
      });
    } catch (err) {
      console.error("Error cancelling order:", err);
      res.status(500).json({
        success: false,
        error: "Failed to cancel order",
        details: err.message
      });
    }
  },

  // Create return/exchange request
  createReturnExchangeRequest: async (req, res) => {
    try {
      const requestData = req.body;

      if (!requestData.orderId || !requestData.orderItemId || !requestData.userId || !requestData.requestType || !requestData.reason) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields"
        });
      }

      const result = await OrderService.createReturnExchangeRequest(requestData);

      res.status(201).json({
        success: true,
        message: "Return/Exchange request created successfully",
        data: result
      });
    } catch (err) {
      console.error("Error creating return/exchange request:", err);
      res.status(500).json({
        success: false,
        error: "Failed to create return/exchange request",
        details: err.message
      });
    }
  },

  // Get return/exchange requests
  getReturnExchangeRequests: async (req, res) => {
    try {
      const userId = req.query.userId || null;
      const status = req.query.status || null;

      const requests = await OrderService.getReturnExchangeRequests(userId, status);

      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (err) {
      console.error("Error fetching return/exchange requests:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch return/exchange requests",
        details: err.message
      });
    }
  },

  // Update return/exchange request status (admin)
  updateReturnExchangeStatus: async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status, adminComment, processedBy, refundAmount } = req.body;

      if (!requestId || !status) {
        return res.status(400).json({
          success: false,
          error: "Request ID and status are required"
        });
      }

      const result = await OrderService.updateReturnExchangeStatus(
        requestId, 
        status, 
        adminComment, 
        processedBy, 
        refundAmount
      );

      res.status(200).json({
        success: true,
        message: "Return/Exchange request status updated successfully",
        data: result
      });
    } catch (err) {
      console.error("Error updating return/exchange status:", err);
      res.status(500).json({
        success: false,
        error: "Failed to update return/exchange status",
        details: err.message
      });
    }
  },

  // Get order statistics (admin)
  getOrderStats: async (req, res) => {
    try {
      const stats = await OrderService.getOrderStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err) {
      console.error("Error fetching order stats:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch order stats",
        details: err.message
      });
    }
  }
};

module.exports = OrderController;