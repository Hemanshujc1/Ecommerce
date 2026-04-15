const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SiteConfiguration = sequelize.define("SiteConfiguration", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.JSON,
    allowNull: false,
  }
}, {
  tableName: "site_configurations",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = SiteConfiguration;
