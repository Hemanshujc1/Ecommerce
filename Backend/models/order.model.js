const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  total_amount: DataTypes.DECIMAL(10, 2),
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  shipping_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  final_amount: DataTypes.DECIMAL(10, 2),
  payment_method: DataTypes.STRING,
  shipping_address: DataTypes.JSON, // { name, email, street, city, state, pincode, phone }
  billing_address: DataTypes.JSON,
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  notes: DataTypes.TEXT,
  estimated_delivery_date: DataTypes.DATE,
  order_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  // Flattened Shipping Tracking Info
  shipping_carrier: DataTypes.STRING,
  shipping_tracking_number: DataTypes.STRING,
  shipping_status: {
    type: DataTypes.STRING,
    defaultValue: 'not_shipped'
  }
}, {
  tableName: "orders",
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const OrderItem = sequelize.define("OrderItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: DataTypes.INTEGER,
  product_name: DataTypes.STRING,
  product_image: DataTypes.STRING,
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  unit_price: DataTypes.DECIMAL(10, 2),
  total_price: DataTypes.DECIMAL(10, 2),
  size: DataTypes.STRING,
  color: DataTypes.STRING
}, {
  tableName: "order_items",
  timestamps: false
});

const OrderStatusHistory = sequelize.define("OrderStatusHistory", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: DataTypes.STRING,
  comment: DataTypes.TEXT,
  changed_by: DataTypes.INTEGER, // Admin ID
}, {
  tableName: "order_status_history",
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const ReturnExchangeRequest = sequelize.define("ReturnExchangeRequest", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order_item_id: DataTypes.INTEGER,
  user_id: DataTypes.INTEGER,
  request_type: DataTypes.STRING, // 'return' or 'exchange'
  reason: DataTypes.STRING,
  description: DataTypes.TEXT,
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  admin_comment: DataTypes.TEXT,
  processed_by: DataTypes.INTEGER,
  refund_amount: DataTypes.DECIMAL(10, 2)
}, {
  tableName: "return_exchange_requests",
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Relationships
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Order.hasMany(OrderStatusHistory, { foreignKey: 'order_id', as: 'statusHistory', onDelete: 'CASCADE' });
OrderStatusHistory.belongsTo(Order, { foreignKey: 'order_id' });

Order.hasMany(ReturnExchangeRequest, { foreignKey: 'order_id', as: 'returnRequests', onDelete: 'CASCADE' });
ReturnExchangeRequest.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = {
  Order,
  OrderItem,
  OrderStatusHistory,
  ReturnExchangeRequest
};