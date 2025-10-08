// models/userInteraction.model.js
const { createConnection } = require("../db/mysql12");

const UserInteractionModel = {
  trackInteraction: async (userId, productId, isWishlisted = false, isInCart = false) => {
    const conn = await createConnection();
    try {
      const [existing] = await conn.query(
        `SELECT id, isWishlisted, isInCart FROM user_product_interactions 
         WHERE user_id = ? AND product_id = ?`,
        [userId, productId]
      );

      if (existing.length > 0) {
        const [result] = await conn.query(
          `UPDATE user_product_interactions 
           SET isWishlisted = ?, isInCart = ?, updated_at = CURRENT_TIMESTAMP()
           WHERE user_id = ? AND product_id = ?`,
          [isWishlisted, isInCart, userId, productId]
        );
        return { success: true, action: 'updated', affectedRows: result.affectedRows };
      } else {
        const [result] = await conn.query(
          `INSERT INTO user_product_interactions (user_id, product_id, isWishlisted, isInCart)
           VALUES (?, ?, ?, ?)`,
          [userId, productId, isWishlisted, isInCart]
        );
        return { success: true, action: 'created', insertId: result.insertId };
      }
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  // Update wishlist status
  updateWishlistStatus: async (userId, productId, isWishlisted) => {
    const conn = await createConnection();
    try {
      // First check if interaction exists
      const [existing] = await conn.query(
        `SELECT id FROM user_product_interactions 
         WHERE user_id = ? AND product_id = ?`,
        [userId, productId]
      );

      if (existing.length > 0) {
        // Update existing
        const [result] = await conn.query(
          `UPDATE user_product_interactions 
           SET isWishlisted = ?, updated_at = CURRENT_TIMESTAMP()
           WHERE user_id = ? AND product_id = ?`,
          [isWishlisted, userId, productId]
        );
        return { success: true, affectedRows: result.affectedRows };
      } else {
        // Create new
        const [result] = await conn.query(
          `INSERT INTO user_product_interactions (user_id, product_id, isWishlisted, isInCart)
           VALUES (?, ?, ?, 0)`,
          [userId, productId, isWishlisted]
        );
        return { success: true, insertId: result.insertId };
      }
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  // Update cart status
  updateCartStatus: async (userId, productId, isInCart) => {
    const conn = await createConnection();
    try {
      // First check if interaction exists
      const [existing] = await conn.query(
        `SELECT id FROM user_product_interactions 
         WHERE user_id = ? AND product_id = ?`,
        [userId, productId]
      );

      if (existing.length > 0) {
        // Update existing
        const [result] = await conn.query(
          `UPDATE user_product_interactions 
           SET isInCart = ?, updated_at = CURRENT_TIMESTAMP()
           WHERE user_id = ? AND product_id = ?`,
          [isInCart, userId, productId]
        );
        return { success: true, affectedRows: result.affectedRows };
      } else {
        // Create new
        const [result] = await conn.query(
          `INSERT INTO user_product_interactions (user_id, product_id, isWishlisted, isInCart)
           VALUES (?, ?, 0, ?)`,
          [userId, productId, isInCart]
        );
        return { success: true, insertId: result.insertId };
      }
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  // Get user interactions
  getUserInteractions: async (userId) => {
    const conn = await createConnection();
    try {
      const [result] = await conn.query(
        `SELECT upi.*, p.product_name, p.brand, pv.price, pv.main_image, pv.discount
         FROM user_product_interactions upi
         LEFT JOIN products p ON upi.product_id = p.id
         LEFT JOIN product_variants pv ON p.id = pv.product_id
         WHERE upi.user_id = ?
         GROUP BY upi.product_id
         ORDER BY upi.updated_at DESC`,
        [userId]
      );
      return result;
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  // Get product interaction stats
  getProductStats: async (productId) => {
    const conn = await createConnection();
    try {
      const [result] = await conn.query(
        `SELECT 
           COUNT(*) as total_interactions,
           SUM(isWishlisted) as wishlist_count,
           SUM(isInCart) as cart_count
         FROM user_product_interactions 
         WHERE product_id = ?`,
        [productId]
      );
      return result[0] || { total_interactions: 0, wishlist_count: 0, cart_count: 0 };
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  // Get popular products (most interacted)
  getPopularProducts: async (limit = 10) => {
    const conn = await createConnection();
    try {
      const [result] = await conn.query(
        `SELECT 
           p.id, p.product_name, p.brand,
           pv.price, pv.main_image, pv.discount,
           COUNT(upi.id) as interaction_count,
           SUM(upi.isWishlisted) as wishlist_count,
           SUM(upi.isInCart) as cart_count
         FROM products p
         LEFT JOIN product_variants pv ON p.id = pv.product_id
         LEFT JOIN user_product_interactions upi ON p.id = upi.product_id
         GROUP BY p.id
         ORDER BY interaction_count DESC, wishlist_count DESC, cart_count DESC
         LIMIT ?`,
        [limit]
      );
      return result;
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  // Get user's wishlist with interaction data
  getUserWishlist: async (userId) => {
    const conn = await createConnection();
    try {
      const [result] = await conn.query(
        `SELECT 
           p.id as productId, p.product_name, p.brand,
           pv.price, pv.main_image, pv.discount, pv.rating,
           upi.created_at as added_to_wishlist_at
         FROM user_product_interactions upi
         LEFT JOIN products p ON upi.product_id = p.id
         LEFT JOIN product_variants pv ON p.id = pv.product_id
         WHERE upi.user_id = ? AND upi.isWishlisted = 1
         GROUP BY p.id
         ORDER BY upi.updated_at DESC`,
        [userId]
      );
      return result;
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  // Get user's cart with interaction data
  getUserCart: async (userId) => {
    const conn = await createConnection();
    try {
      const [result] = await conn.query(
        `SELECT 
           p.id as productId, p.product_name, p.brand,
           pv.price, pv.main_image, pv.discount, pv.rating,
           uc.quantity,
           upi.created_at as added_to_cart_at
         FROM user_product_interactions upi
         LEFT JOIN products p ON upi.product_id = p.id
         LEFT JOIN product_variants pv ON p.id = pv.product_id
         LEFT JOIN user_cart uc ON (p.id = uc.product_id AND uc.user_id = ?)
         WHERE upi.user_id = ? AND upi.isInCart = 1
         GROUP BY p.id
         ORDER BY upi.updated_at DESC`,
        [userId, userId]
      );
      return result;
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  // Remove interaction
  removeInteraction: async (userId, productId) => {
    const conn = await createConnection();
    try {
      const [result] = await conn.query(
        `DELETE FROM user_product_interactions 
         WHERE user_id = ? AND product_id = ?`,
        [userId, productId]
      );
      return { success: true, affectedRows: result.affectedRows };
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  }
};

module.exports = UserInteractionModel;