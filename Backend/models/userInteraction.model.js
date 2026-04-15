const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserInteraction = sequelize.define("UserInteraction", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isWishlisted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isInCart: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  cart_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: "user_product_interactions",
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['product_id'] },
    { fields: ['isWishlisted'] },
    { fields: ['isInCart'] }
  ]
});

module.exports = UserInteraction;