const { 
  Product, 
  ProductVariant, 
  UserInteraction,
  sequelize
} = require("../models");

const ProductService = {
  addProduct: async (parsedData) => {
    // Create product with nested variants using JSON columns
    const transaction = await sequelize.transaction();
    try {
      const product = await Product.create({
        product_name: parsedData.product_name,
        brand: parsedData.brand,
        category: parsedData.category,
        main_category: parsedData.main_category,
        sub_category: parsedData.sub_category,
        short_description: parsedData.short_description,
        sections: parsedData.sections || [],
        variants: (parsedData.variants || []).map(v => ({
          color: v.color,
          rating: v.rating || 0,
          rating_count: v.ratingCount || 0,
          price: v.price,
          discount: v.discount || 0,
          features: v.features || {},
          main_image: v.mainImage,
          sizes: v.sizes ? v.sizes.map(s => ({ size: s.size, stock: s.stock })) : [],
          coupons: v.coupons ? v.coupons.map(c => ({ name: c.name, discount: c.discount })) : [],
          related_images: v.relatedImages || [],
          videos: v.videos || []
        }))
      }, {
        include: [{ model: ProductVariant, as: 'variants' }],
        transaction
      });
      await transaction.commit();
      return { success: true, productId: product.id };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  getAllProducts: async () => {
    const products = await Product.findAll({
      include: [{ model: ProductVariant, as: 'variants' }]
    });

    // Formatting for frontend consistency
    return products.map(product => {
      const prodJson = product.toJSON();
      if (prodJson.variants && prodJson.variants.length > 0) {
        const firstVariant = prodJson.variants[0];
        return {
          ...prodJson,
          main_image: firstVariant.main_image,
          price: firstVariant.price,
          discount: firstVariant.discount,
          rating: firstVariant.rating,
          color: firstVariant.color,
          total_stock: (firstVariant.sizes || []).reduce((acc, curr) => acc + (curr.stock || 0), 0)
        };
      }
      return prodJson;
    });
  },

  getProductById: async (productId) => {
    const product = await Product.findByPk(productId, {
      include: [{ model: ProductVariant, as: 'variants' }]
    });
    
    if (!product) return null;
    return product.toJSON();
  },

  updateProduct: async (productId, productData) => {
    const transaction = await sequelize.transaction();
    try {
      // Update core product data
      await Product.update({
        product_name: productData.product_name,
        brand: productData.brand,
        category: productData.category,
        main_category: productData.main_category,
        sub_category: productData.sub_category,
        short_description: productData.short_description,
        sections: productData.sections || []
      }, { where: { id: productId }, transaction });

      // For variants, we clear old ones and recreate (simpler with JSON)
      await ProductVariant.destroy({ where: { product_id: productId }, transaction });
      
      if (productData.variants && productData.variants.length > 0) {
        const variantData = productData.variants.map(v => ({
          product_id: productId,
          color: v.color,
          rating: v.rating || 0,
          rating_count: v.ratingCount || 0,
          price: v.price,
          discount: v.discount || 0,
          features: v.features || {},
          main_image: v.mainImage,
          sizes: (v.sizes || []).map(s => ({ size: s.size, stock: s.stock })),
          coupons: (v.coupons || []).map(c => ({ name: c.name, discount: c.discount })),
          related_images: v.relatedImages || [],
          videos: v.videos || []
        }));
        await ProductVariant.bulkCreate(variantData, { transaction });
      }

      await transaction.commit();
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    const transaction = await sequelize.transaction();
    try {
      // Cascade delete variants (handled by onDelete: 'CASCADE' in model usually, but being explicit here)
      await ProductVariant.destroy({ where: { product_id: productId }, transaction });
      await Product.destroy({ where: { id: productId }, transaction });

      await transaction.commit();
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Refactored Wishlist/Cart methods to use consolidated UserInteraction model
  addToWishlist: async (userId, productId) => {
    const [interaction, created] = await UserInteraction.findOrCreate({
      where: { user_id: userId, product_id: productId },
      defaults: { isWishlisted: true, isInCart: false, cart_quantity: 0 }
    });
    if (!created) {
      await interaction.update({ isWishlisted: true });
    }
    return { success: true };
  },

  removeFromWishlist: async (userId, productId) => {
    await UserInteraction.update(
      { isWishlisted: false },
      { where: { user_id: userId, product_id: productId } }
    );
    return { success: true };
  },
  
  addToCart: async (userId, productId, quantity) => {
    const [interaction, created] = await UserInteraction.findOrCreate({ 
      where: { user_id: userId, product_id: productId },
      defaults: { isInCart: true, cart_quantity: quantity, isWishlisted: false } 
    });
    if (!created) {
      await interaction.update({ 
        isInCart: true, 
        cart_quantity: interaction.cart_quantity + (parseInt(quantity) || 1) 
      });
    }
    return { success: true };
  },

  removeFromCart: async (userId, productId) => {
    await UserInteraction.update(
      { isInCart: false, cart_quantity: 0 },
      { where: { user_id: userId, product_id: productId } }
    );
    return { success: true };
  },

  getUserCart: async (userId) => {
    return await UserInteraction.findAll({
      where: { user_id: userId, isInCart: true }
    });
  },

  getUserWishlist: async (userId) => {
    return await UserInteraction.findAll({ 
      where: { user_id: userId, isWishlisted: true } 
    });
  },

  updateCartQuantity: async (userId, productId, quantity) => {
    const qty = parseInt(quantity);
    if (qty <= 0) {
      await UserInteraction.update(
        { isInCart: false, cart_quantity: 0 },
        { where: { user_id: userId, product_id: productId } }
      );
    } else {
      await UserInteraction.update(
        { isInCart: true, cart_quantity: qty },
        { where: { user_id: userId, product_id: productId } }
      );
    }
    return { success: true };
  },

  getProductStock: async (productId) => {
    const variants = await ProductVariant.findAll({
      where: { product_id: productId }
    });
    return variants.reduce((acc, v) => {
      const variantStock = (v.sizes || []).reduce((sAcc, s) => sAcc + (s.stock || 0), 0);
      return acc + variantStock;
    }, 0);
  },
  
};

module.exports = ProductService;
