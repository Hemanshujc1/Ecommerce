const { sequelize } = require("../config/database");

const { User, Lead } = require("./user.model");
const BlacklistToken = require("./BlacklistToken.model");
const SiteConfiguration = require("./configuration.model");
const { 
  Product, 
  ProductVariant
} = require("./product.model");
const { 
  Order, 
  OrderItem, 
  OrderStatusHistory, 
  ReturnExchangeRequest 
} = require("./order.model");
const UserInteraction = require("./userInteraction.model");

// Export all models and the sequelize instance
module.exports = {
  sequelize,
  User,
  Lead,
  BlacklistToken,
  SiteConfiguration,
  Product,
  ProductVariant,
  Order,
  OrderItem,
  OrderStatusHistory,
  ReturnExchangeRequest,
  UserInteraction
};
