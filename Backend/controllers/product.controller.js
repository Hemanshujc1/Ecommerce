// controllers/product.controller.js
const ProductService = require("../services/product.service");
const path = require("path");
const fs = require("fs");

 const saveFile = (file, folderPath) => {
  const fileName = `${Date.now()}_${file.name}`;
  const uploadPath = path.join(__dirname, "..", "public", "upload", folderPath, fileName);
  
  // Create directory if it doesn't exist
  const dir = path.dirname(uploadPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(uploadPath, file.data);
  return `/${folderPath}/${fileName}`;
};

const ProductController = {
  addProduct: async (req, res) => {
    try {
      const {
        product_name,
        brand,
        category,
        main_category,
        sub_category,
        short_description,
      } = req.body;

      const generalData = {
        product_name,
        brand,
        category,
        main_category,
        sub_category,
        short_description,
      };

      const sections = JSON.parse(req.body.sections);
      const variants = JSON.parse(req.body.variants);

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const variantFolder = `products/variant_${i}`;

        const mainImgKey = `variant_${i}_mainImage`;
        if (req.files && req.files[mainImgKey]) {
          variant.mainImage = saveFile(req.files[mainImgKey], variantFolder);
        }

        variant.relatedImages = [];
        for (let j = 0; j < 4; j++) {
          const relKey = `variant_${i}_relatedImage_${j}`;
          if (req.files && req.files[relKey]) {
            variant.relatedImages.push(
              saveFile(req.files[relKey], variantFolder)
            );
          }
        }

        variant.videos = [];
        for (let j = 0; j < 2; j++) {
          const vidKey = `variant_${i}_video_${j}`;
          if (req.files && req.files[vidKey]) {
            variant.videos.push(saveFile(req.files[vidKey], variantFolder));
          }
        }
      }

      const finalData = {
        ...generalData,
        sections,
        variants,
      };

      const result = await ProductService.addProduct(finalData);

      res.status(200).json({ message: "Product added successfully", result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add product", details: err.message });
    }
  },

  getAllProducts: async (req, res) => {
    try {
      const products = await ProductService.getAllProducts();
      res.status(200).json({ success: true, products });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch products", details: err.message });
    }
  },

  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.status(200).json({ success: true, product });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch product", details: err.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        product_name,
        brand,
        category,
        main_category,
        sub_category,
        short_description,
      } = req.body;

      const generalData = {
        product_name,
        brand,
        category,
        main_category,
        sub_category,
        short_description,
      };

      const sections = JSON.parse(req.body.sections);
      const variants = JSON.parse(req.body.variants);

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const variantFolder = `products/variant_${i}`;

        const mainImgKey = `variant_${i}_mainImage`;
        if (req.files && req.files[mainImgKey]) {
          variant.mainImage = saveFile(req.files[mainImgKey], variantFolder);
        }

        variant.relatedImages = variant.relatedImages || [];
        for (let j = 0; j < 4; j++) {
          const relKey = `variant_${i}_relatedImage_${j}`;
          if (req.files && req.files[relKey]) {
            variant.relatedImages.push(
              saveFile(req.files[relKey], variantFolder)
            );
          }
        }

        variant.videos = variant.videos || [];
        for (let j = 0; j < 2; j++) {
          const vidKey = `variant_${i}_video_${j}`;
          if (req.files && req.files[vidKey]) {
            variant.videos.push(saveFile(req.files[vidKey], variantFolder));
          }
        }
      }

      const finalData = {
        ...generalData,
        sections,
        variants,
      };

      const result = await ProductService.updateProduct(id, finalData);
      res.status(200).json({ message: "Product updated successfully", result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update product", details: err.message });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await ProductService.deleteProduct(id);
      res.status(200).json({ message: "Product deleted successfully", result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete product", details: err.message });
    }
  },
  addToWishlist: async (req, res) => {
    try {
      const { productId, userId } = req.body;
      if (!productId || !userId) {
        return res.status(400).json({ error: "Product ID and User ID are required" });
      }
      const result = await ProductService.addToWishlist(userId, productId);
      res.status(200).json({ success: true, message: "Product added to wishlist successfully", result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add product to wishlist", details: err.message });
    }
  },
  removeFromWishlist: async (req, res) => {
    try {
      const { productId, userId } = req.body;
      if (!productId || !userId) {
        return res.status(400).json({ error: "Product ID and User ID are required" });
      }
      const result = await ProductService.removeFromWishlist(userId, productId);
      res.status(200).json({ success: true, message: "Product removed from wishlist", result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to remove product from wishlist", details: err.message });
    }
  },
  
  
  addToCart: async (req, res) => {
    try {
      const { productId, userId, quantity } = req.body;
      if (!productId || !userId || !quantity) {
        return res.status(400).json({ error: "Product ID, User ID, and Quantity are required" });
      }
      const result = await ProductService.addToCart(userId, productId, quantity);
      res.status(200).json({ success: true, message: "Product added to cart successfully", result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add product to cart", details: err.message });
    }
  },
  removeFromCart: async (req, res) => {
    try {
      const { productId, userId } = req.body;
      if (!productId || !userId) {
        return res.status(400).json({ error: "Product ID and User ID are required" });
      }
      const result = await ProductService.removeFromCart(userId, productId);
      res.status(200).json({ success: true, message: "Product removed from cart", result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to remove product from cart", details: err.message });
    }
  },

  getUserCart: async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      const result = await ProductService.getUserCart(userId);
      res.status(200).json({ success: true, cart: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch user cart", details: err.message });
    }
  },

  getUserWishlist: async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      const result = await ProductService.getUserWishlist(userId);
      res.status(200).json({ success: true, wishlist: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch user wishlist", details: err.message });
    }
  },

  updateCartQuantity: async (req, res) => {
    try {
      const { productId, userId, quantity } = req.body;
      if (!productId || !userId || quantity === undefined) {
        return res.status(400).json({ error: "Product ID, User ID, and Quantity are required" });
      }
      const result = await ProductService.updateCartQuantity(userId, productId, quantity);
      res.status(200).json({ success: true, message: "Cart quantity updated successfully", result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update cart quantity", details: err.message });
    }
  },
  
};

module.exports = ProductController;