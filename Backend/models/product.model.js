// models/product.model.js
const { createConnection } = require("../db/mysql12");

const ProductModel = {
  createProduct: async (productData) => {
    const conn = await createConnection();

    try {
      await conn.beginTransaction();

      const [productResult] = await conn.query(
        `INSERT INTO products (product_name, brand, category, main_category, sub_category, short_description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          productData.product_name,
          productData.brand,
          productData.category,
          productData.main_category,
          productData.sub_category,
          productData.short_description,
          false,
          0,
        ]
      );
      const productId = productResult.insertId;

      for (const section of productData.sections) {
        await conn.query(
          `INSERT INTO product_sections (product_id, title, content) VALUES (?, ?, ?)`,
          [productId, section.title, section.content]
        );
      }

      // Insert Variants
      for (const [i, variant] of productData.variants.entries()) {
        const [variantResult] = await conn.query(
          `INSERT INTO product_variants 
           (product_id, color, rating, rating_count, price, discount, features, main_image)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            productId,
            variant.color,
            variant.rating,
            variant.ratingCount,
            variant.price,
            variant.discount,
            variant.features,
            variant.mainImage,
          ]
        );
        const variantId = variantResult.insertId;

        // Insert Sizes
        for (const sizeObj of variant.sizes) {
          await conn.query(
            `INSERT INTO variant_sizes (variant_id, size, stock) VALUES (?, ?, ?)`,
            [variantId, sizeObj.size, sizeObj.stock]
          );
        }

        // Insert Coupons
        for (const coupon of variant.coupons) {
          await conn.query(
            `INSERT INTO variant_coupons (variant_id, name, discount) VALUES (?, ?, ?)`,
            [variantId, coupon.name, coupon.discount]
          );
        }

        // Insert Related Images
        for (const imagePath of variant.relatedImages) {
          await conn.query(
            `INSERT INTO variant_related_images (variant_id, image_path) VALUES (?, ?)`,
            [variantId, imagePath]
          );
        }

        // Insert Videos
        for (const videoPath of variant.videos) {
          await conn.query(
            `INSERT INTO variant_videos (variant_id, video_path) VALUES (?, ?)`,
            [variantId, videoPath]
          );
        }
      }

      await conn.commit();
      return { success: true, productId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.end();
    }
  },

  getAllProducts: async () => {
    const conn = await createConnection();
    try {
      const [products] = await conn.query(`
        SELECT p.*, 
               pv.main_image,
               pv.price,
               pv.discount,
               pv.rating,
               pv.color,
               COALESCE(SUM(vs.stock), 0) as total_stock,
               GROUP_CONCAT(DISTINCT CONCAT(ps.title, ':', ps.content) SEPARATOR '|') as sections
        FROM products p
        LEFT JOIN product_sections ps ON p.id = ps.product_id
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        LEFT JOIN variant_sizes vs ON pv.id = vs.variant_id
        GROUP BY p.id, pv.id
        ORDER BY p.id, pv.id
      `);
      
      // Group products by id to handle multiple variants
      const groupedProducts = {};
      products.forEach(product => {
        if (!groupedProducts[product.id]) {
          groupedProducts[product.id] = {
            ...product,
            variants: []
          };
        }
        if (product.main_image) {
          groupedProducts[product.id].variants.push({
            main_image: product.main_image,
            price: product.price,
            discount: product.discount,
            rating: product.rating,
            color: product.color
          });
        }
      });
      
      // Convert back to array and add first variant data to main product
      const result = Object.values(groupedProducts).map(product => {
        if (product.variants.length > 0) {
          const firstVariant = product.variants[0];
          return {
            ...product,
            main_image: firstVariant.main_image,
            price: firstVariant.price,
            discount: firstVariant.discount,
            rating: firstVariant.rating,
            color: firstVariant.color
          };
        }
        return product;
      });
      
      return result;
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  getProductById: async (productId) => {
    const conn = await createConnection();
    try {
      const [products] = await conn.query(
        `
        SELECT * FROM products WHERE id = ?
      `,
        [productId]
      );

      if (products.length === 0) return null;

      const product = products[0];

      // Get sections
      const [sections] = await conn.query(
        `
        SELECT * FROM product_sections WHERE product_id = ?
      `,
        [productId]
      );

      // Get variants with all related data
      const [variants] = await conn.query(
        `
        SELECT * FROM product_variants WHERE product_id = ?
      `,
        [productId]
      );

      for (let variant of variants) {
        // Get sizes
        const [sizes] = await conn.query(
          `
          SELECT size, stock FROM variant_sizes WHERE variant_id = ?
        `,
          [variant.id]
        );

        // Get coupons
        const [coupons] = await conn.query(
          `
          SELECT name, discount FROM variant_coupons WHERE variant_id = ?
        `,
          [variant.id]
        );

        // Get related images
        const [relatedImages] = await conn.query(
          `
          SELECT image_path FROM variant_related_images WHERE variant_id = ?
        `,
          [variant.id]
        );

        // Get videos
        const [videos] = await conn.query(
          `
          SELECT video_path FROM variant_videos WHERE variant_id = ?
        `,
          [variant.id]
        );

        variant.sizes = sizes;
        variant.coupons = coupons;
        variant.relatedImages = relatedImages.map((img) => img.image_path);
        variant.videos = videos.map((vid) => vid.video_path);
      }

      product.sections = sections;
      product.variants = variants;

      return product;
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  updateProduct: async (productId, productData) => {
    const conn = await createConnection();
    try {
      await conn.beginTransaction();

      // Update main product info
      await conn.query(
        `UPDATE products SET product_name = ?, brand = ?, category = ?, main_category = ?, sub_category = ?, short_description = ? WHERE id = ?`,
        [
          productData.product_name,
          productData.brand,
          productData.category,
          productData.main_category,
          productData.sub_category,
          productData.short_description,
          productId,
        ]
      );

      await conn.query(
        `DELETE FROM variant_videos WHERE variant_id IN (SELECT id FROM product_variants WHERE product_id = ?)`,
        [productId]
      );
      await conn.query(
        `DELETE FROM variant_related_images WHERE variant_id IN (SELECT id FROM product_variants WHERE product_id = ?)`,
        [productId]
      );
      await conn.query(
        `DELETE FROM variant_coupons WHERE variant_id IN (SELECT id FROM product_variants WHERE product_id = ?)`,
        [productId]
      );
      await conn.query(
        `DELETE FROM variant_sizes WHERE variant_id IN (SELECT id FROM product_variants WHERE product_id = ?)`,
        [productId]
      );
      await conn.query(`DELETE FROM product_variants WHERE product_id = ?`, [
        productId,
      ]);
      await conn.query(`DELETE FROM product_sections WHERE product_id = ?`, [
        productId,
      ]);

      // Insert new sections
      for (const section of productData.sections) {
        await conn.query(
          `INSERT INTO product_sections (product_id, title, content) VALUES (?, ?, ?)`,
          [productId, section.title, section.content]
        );
      }

      // Insert new variants
      for (const [i, variant] of productData.variants.entries()) {
        const [variantResult] = await conn.query(
          `INSERT INTO product_variants 
           (product_id, color, rating, rating_count, price, discount, features, main_image)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            productId,
            variant.color,
            variant.rating,
            variant.ratingCount,
            variant.price,
            variant.discount,
            variant.features,
            variant.mainImage,
          ]
        );
        const variantId = variantResult.insertId;

        // Insert sizes
        for (const sizeObj of variant.sizes) {
          await conn.query(
            `INSERT INTO variant_sizes (variant_id, size, stock) VALUES (?, ?, ?)`,
            [variantId, sizeObj.size, sizeObj.stock]
          );
        }

        // Insert coupons
        for (const coupon of variant.coupons) {
          await conn.query(
            `INSERT INTO variant_coupons (variant_id, name, discount) VALUES (?, ?, ?)`,
            [variantId, coupon.name, coupon.discount]
          );
        }

        // Insert related images
        for (const imagePath of variant.relatedImages) {
          await conn.query(
            `INSERT INTO variant_related_images (variant_id, image_path) VALUES (?, ?)`,
            [variantId, imagePath]
          );
        }

        // Insert videos
        for (const videoPath of variant.videos) {
          await conn.query(
            `INSERT INTO variant_videos (variant_id, video_path) VALUES (?, ?)`,
            [variantId, videoPath]
          );
        }
      }

      await conn.commit();
      return { success: true };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.end();
    }
  },

  deleteProduct: async (productId) => {
    const conn = await createConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `DELETE FROM variant_videos WHERE variant_id IN (SELECT id FROM product_variants WHERE product_id = ?)`,
        [productId]
      );
      await conn.query(
        `DELETE FROM variant_related_images WHERE variant_id IN (SELECT id FROM product_variants WHERE product_id = ?)`,
        [productId]
      );
      await conn.query(
        `DELETE FROM variant_coupons WHERE variant_id IN (SELECT id FROM product_variants WHERE product_id = ?)`,
        [productId]
      );
      await conn.query(
        `DELETE FROM variant_sizes WHERE variant_id IN (SELECT id FROM product_variants WHERE product_id = ?)`,
        [productId]
      );
      await conn.query(`DELETE FROM product_variants WHERE product_id = ?`, [
        productId,
      ]);
      await conn.query(`DELETE FROM product_sections WHERE product_id = ?`, [
        productId,
      ]);
      await conn.query(`DELETE FROM products WHERE id = ?`, [productId]);

      await conn.commit();
      return { success: true };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.end();
    }
  },
  addToWishlist: async (userId, productId) => {
    const conn = await createConnection();
    try {
      const [result] = await conn.query(
        `INSERT IGNORE INTO user_wishlist (user_id, product_id) VALUES (?, ?)`,
        [userId, productId]
      );
      return { success: true, affectedRows: result.affectedRows };
    } finally {
      conn.end();
    }
  },
  
  removeFromWishlist: async (userId, productId) => {
    const conn = await createConnection();
    try {
      const [result] = await conn.query(
        `DELETE FROM user_wishlist WHERE user_id = ? AND product_id = ?`,
        [userId, productId]
      );
      return { success: true, affectedRows: result.affectedRows };
    } finally {
      conn.end();
    }
  },
  addToCart: async (userId, productId, quantity) => {
    const conn = await createConnection();
    try {
      const [result] = await conn.query(
        `INSERT INTO user_cart (user_id, product_id, quantity) VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
        [userId, productId, quantity, quantity]
      );
      return { success: true, affectedRows: result.affectedRows };
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },
  removeFromCart: async (userId, productId) => {
    const conn = await createConnection();
    try {
      const [result] = await conn.query(
        `DELETE FROM user_cart WHERE user_id = ? AND product_id = ?`,
        [userId, productId]
      );
      return { success: true, affectedRows: result.affectedRows };
    } finally {
      conn.end();
    }
  },

  getUserCart: async (userId) => {
    const conn = await createConnection();
    try {
      const [result] = await conn.query(
        `SELECT uc.product_id as productId, uc.quantity, p.product_name, pv.price, pv.main_image, pv.discount, pv.rating
         FROM user_cart uc 
         LEFT JOIN products p ON uc.product_id = p.id
         LEFT JOIN product_variants pv ON p.id = pv.product_id
         WHERE uc.user_id = ?
         GROUP BY uc.product_id`,
        [userId]
      );
      return result;
    } finally {
      conn.end();
    }
  },

  getUserWishlist: async (userId) => {
    const conn = await createConnection();
    try {
      const [result] = await conn.query(
        `SELECT uw.product_id as productId, p.product_name, pv.price, pv.main_image, pv.discount, pv.rating
         FROM user_wishlist uw 
         LEFT JOIN products p ON uw.product_id = p.id
         LEFT JOIN product_variants pv ON p.id = pv.product_id
         WHERE uw.user_id = ?
         GROUP BY uw.product_id`,
        [userId]
      );
      return result;
    } finally {
      conn.end();
    }
  },

  updateCartQuantity: async (userId, productId, quantity) => {
    const conn = await createConnection();
    try {
      if (quantity <= 0) {
        // If quantity is 0 or less, remove the item
        const [result] = await conn.query(
          `DELETE FROM user_cart WHERE user_id = ? AND product_id = ?`,
          [userId, productId]
        );
        return { success: true, affectedRows: result.affectedRows };
      } else {
        // Update the quantity
        const [result] = await conn.query(
          `UPDATE user_cart SET quantity = ? WHERE user_id = ? AND product_id = ?`,
          [quantity, userId, productId]
        );
        return { success: true, affectedRows: result.affectedRows };
      }
    } finally {
      conn.end();
    }
  },

  getProductStock: async (productId) => {
    const conn = await createConnection();
    try {
      const [result] = await conn.query(
        `SELECT SUM(vs.stock) as total_stock
         FROM product_variants pv
         LEFT JOIN variant_sizes vs ON pv.id = vs.variant_id
         WHERE pv.product_id = ?`,
        [productId]
      );
      return result[0]?.total_stock || 0;
    } finally {
      conn.end();
    }
  },
  
};

module.exports = ProductModel;
