const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  brand: DataTypes.STRING,
  category: DataTypes.STRING,
  main_category: DataTypes.STRING,
  short_description: DataTypes.TEXT,
  sections: {
    type: DataTypes.JSON,
    defaultValue: [] // Array of { title, content }
  }
}, {
  tableName: "products",
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const ProductVariant = sequelize.define("ProductVariant", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  color: DataTypes.STRING,
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  features: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  main_image: DataTypes.STRING,
  sizes: {
    type: DataTypes.JSON,
    defaultValue: [] // Array of { size, stock }
  },
  coupons: {
    type: DataTypes.JSON,
    defaultValue: [] // Array of { name, discount }
  },
  related_images: {
    type: DataTypes.JSON,
    defaultValue: [] // Array of string paths
  },
  videos: {
    type: DataTypes.JSON,
    defaultValue: [] // Array of string paths
  }
}, {
  tableName: "product_variants",
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['product_id'] }
  ]
});

// Relationships
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = {
  Product,
  ProductVariant
};
