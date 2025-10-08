// services/order.service.js
const OrderModel = require("../models/order.model");

const OrderService = {
  createOrder: async (orderData) => {
    return await OrderModel.createOrder(orderData);
  },

  getAllOrders: async (limit, offset, status) => {
    return await OrderModel.getAllOrders(limit, offset, status);
  },

  getUserOrders: async (userId, limit, offset) => {
    return await OrderModel.getUserOrders(userId, limit, offset);
  },

  getOrderById: async (orderId) => {
    return await OrderModel.getOrderById(orderId);
  },

  updateOrderStatus: async (orderId, status, comment, changedBy) => {
    return await OrderModel.updateOrderStatus(orderId, status, comment, changedBy);
  },

  cancelOrder: async (orderId, reason, userId) => {
    return await OrderModel.cancelOrder(orderId, reason, userId);
  },

  createReturnExchangeRequest: async (requestData) => {
    return await OrderModel.createReturnExchangeRequest(requestData);
  },

  getReturnExchangeRequests: async (userId, status) => {
    return await OrderModel.getReturnExchangeRequests(userId, status);
  },

  updateReturnExchangeStatus: async (requestId, status, adminComment, processedBy, refundAmount) => {
    return await OrderModel.updateReturnExchangeStatus(requestId, status, adminComment, processedBy, refundAmount);
  },

  getOrderStats: async () => {
    return await OrderModel.getOrderStats();
  }
};

module.exports = OrderService;