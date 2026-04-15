const { DataTypes, literal } = require("sequelize");
const { sequelize } = require("../config/database");

const BlacklistToken = sequelize.define("BlacklistToken", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    defaultValue: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d;
    },
  }
}, {
  tableName: "blacklisted_tokens",
  timestamps: false,
});

module.exports = BlacklistToken;
