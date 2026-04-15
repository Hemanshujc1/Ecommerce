// services/userInteraction.service.js
const { UserInteraction, Product } = require("../models");
const { Sequelize } = require("sequelize");
const { sequelize } = require("../config/database");

const UserInteractionService = {
  trackInteraction: async (userId, productId, isWishlisted, isInCart, quantity = 0) => {
    const [interaction, created] = await UserInteraction.findOrCreate({
      where: { user_id: userId, product_id: productId },
      defaults: { isWishlisted, isInCart, cart_quantity: quantity }
    });
    if (!created) {
      return await interaction.update({ isWishlisted, isInCart, cart_quantity: quantity });
    }
    return interaction;
  },

  updateWishlistStatus: async (userId, productId, isWishlisted) => {
    const [interaction, created] = await UserInteraction.findOrCreate({
      where: { user_id: userId, product_id: productId },
      defaults: { isWishlisted, isInCart: false, cart_quantity: 0 }
    });
    if (!created) {
      return await interaction.update({ isWishlisted });
    }
    return interaction;
  },

  updateCartStatus: async (userId, productId, isInCart, quantity = 1) => {
    const [interaction, created] = await UserInteraction.findOrCreate({
      where: { user_id: userId, product_id: productId },
      defaults: { isInCart, cart_quantity: quantity, isWishlisted: false }
    });
    if (!created) {
      const updates = { isInCart };
      if (isInCart) updates.cart_quantity = quantity;
      else updates.cart_quantity = 0;
      return await interaction.update(updates);
    }
    return interaction;
  },

  getUserInteractions: async (userId) => {
    const query = `
      SELECT 
        ui.id, ui.user_id, ui.product_id, ui.isWishlisted, ui.isInCart, ui.cart_quantity, ui.updated_at,
        p.product_name, p.brand,
        pv.price, pv.discount, pv.main_image
      FROM user_product_interactions ui
      INNER JOIN products p ON ui.product_id = p.id
      LEFT JOIN (
        SELECT product_id, MIN(price) as price, MAX(discount) as discount, MIN(main_image) as main_image
        FROM product_variants
        GROUP BY product_id
      ) pv ON p.id = pv.product_id
      WHERE ui.user_id = :userId
      ORDER BY ui.updated_at DESC
    `;
    return await sequelize.query(query, {
      replacements: { userId },
      type: Sequelize.QueryTypes.SELECT
    });
  },

  getProductStats: async (productId) => {
    const wishlistCount = await UserInteraction.count({
      where: { product_id: productId, isWishlisted: true }
    });
    const cartCount = await UserInteraction.count({
      where: { product_id: productId, isInCart: true }
    });
    return { wishlistCount, cartCount };
  },

  getPopularProducts: async (limit) => {
    const query = `
      SELECT 
        p.id, p.product_name, p.brand,
        pv.price, pv.discount, pv.main_image,
        COUNT(ui.id) as interaction_count,
        SUM(CASE WHEN ui.isWishlisted THEN 1 ELSE 0 END) as wishlist_count,
        SUM(CASE WHEN ui.isInCart THEN 1 ELSE 0 END) as cart_count
      FROM user_product_interactions ui
      INNER JOIN products p ON ui.product_id = p.id
      LEFT JOIN (
        SELECT product_id, MIN(price) as price, MAX(discount) as discount, MIN(main_image) as main_image
        FROM product_variants
        GROUP BY product_id
      ) pv ON p.id = pv.product_id
      WHERE ui.isWishlisted = true OR ui.isInCart = true
      GROUP BY p.id, p.product_name, p.brand, pv.price, pv.discount, pv.main_image
      ORDER BY interaction_count DESC
      LIMIT :limit
    `;
    return await sequelize.query(query, {
      replacements: { limit: parseInt(limit) || 10 },
      type: Sequelize.QueryTypes.SELECT
    });
  },

  getUserWishlist: async (userId) => {
    const query = `
      SELECT 
        ui.id, ui.user_id, ui.product_id, ui.isWishlisted, ui.isInCart, ui.updated_at,
        p.product_name, p.brand,
        pv.price, pv.discount, pv.main_image
      FROM user_product_interactions ui
      INNER JOIN products p ON ui.product_id = p.id
      LEFT JOIN (
        SELECT product_id, MIN(price) as price, MAX(discount) as discount, MIN(main_image) as main_image
        FROM product_variants
        GROUP BY product_id
      ) pv ON p.id = pv.product_id
      WHERE ui.user_id = :userId AND ui.isWishlisted = true
      ORDER BY ui.updated_at DESC
    `;
    return await sequelize.query(query, {
      replacements: { userId },
      type: Sequelize.QueryTypes.SELECT
    });
  },

  getUserCart: async (userId) => {
    const query = `
      SELECT 
        ui.id, ui.user_id, ui.product_id, ui.isWishlisted, ui.isInCart, ui.cart_quantity, ui.updated_at,
        p.product_name, p.brand,
        pv.price, pv.discount, pv.main_image
      FROM user_product_interactions ui
      INNER JOIN products p ON ui.product_id = p.id
      LEFT JOIN (
        SELECT product_id, MIN(price) as price, MAX(discount) as discount, MIN(main_image) as main_image
        FROM product_variants
        GROUP BY product_id
      ) pv ON p.id = pv.product_id
      WHERE ui.user_id = :userId AND ui.isInCart = true
      ORDER BY ui.updated_at DESC
    `;
    return await sequelize.query(query, {
      replacements: { userId },
      type: Sequelize.QueryTypes.SELECT
    });
  },

  removeInteraction: async (userId, productId) => {
    const result = await UserInteraction.destroy({
      where: { user_id: userId, product_id: productId }
    });
    return result > 0;
  }
};

module.exports = UserInteractionService;