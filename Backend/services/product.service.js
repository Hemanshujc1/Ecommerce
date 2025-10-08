// services/product.service.js
const ProductModel = require("../models/product.model");

const ProductService = {
  addProduct: async (parsedData) => {
    return await ProductModel.createProduct(parsedData);
  },

  getAllProducts: async () => {
    return await ProductModel.getAllProducts();
  },

  getProductById: async (productId) => {
    return await ProductModel.getProductById(productId);
  },

  updateProduct: async (productId, productData) => {
    return await ProductModel.updateProduct(productId, productData);
  },

  deleteProduct: async (productId) => {
    return await ProductModel.deleteProduct(productId);
  },
  addToWishlist: async (userId, productId) => {
    return await ProductModel.addToWishlist(userId, productId);
  },
  removeFromWishlist: async (userId, productId) => {
    return await ProductModel.removeFromWishlist(userId, productId);
  },
  
  addToCart: async (userId, productId, quantity) => {
    return await ProductModel.addToCart(userId, productId, quantity);
  },
  removeFromCart: async (userId, productId) => {
    return await ProductModel.removeFromCart(userId, productId);
  },

  getUserCart: async (userId) => {
    return await ProductModel.getUserCart(userId);
  },

  getUserWishlist: async (userId) => {
    return await ProductModel.getUserWishlist(userId);
  },

  updateCartQuantity: async (userId, productId, quantity) => {
    return await ProductModel.updateCartQuantity(userId, productId, quantity);
  },

  getProductStock: async (productId) => {
    return await ProductModel.getProductStock(productId);
  },
  
};

module.exports = ProductService;
