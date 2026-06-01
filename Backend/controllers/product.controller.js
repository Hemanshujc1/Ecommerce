// controllers/product.controller.js
const ProductService = require("../services/product.service");
const path = require("path");
const fs = require("fs");
const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");

const saveFile = (file, folderPath) => {
  const fileName = `${Date.now()}_${file.name}`;
  const uploadPath = path.join(__dirname, "..", "public", "upload", folderPath, fileName);
  
  // Create directory if it doesn't exist
  const dir = path.dirname(uploadPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(uploadPath, file.data);
  // Return path relative to the public/upload folder, without leading slash
  return `${folderPath}/${fileName}`;
};

const ProductController = {
  addProduct: catchAsync(async (req, res) => {
    const {
      product_name,
      brand,
      category,
      main_category,
      short_description,
    } = req.body;

    const generalData = {
      product_name,
      brand,
      category,
      main_category,
      short_description,
    };

    const sections = JSON.parse(req.body.sections || "[]");
    const variants = JSON.parse(req.body.variants || "[]");

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

    return res
      .status(201)
      .json(new ApiResponse(201, result, "Product added successfully"));
  }),

  getAllProducts: catchAsync(async (req, res) => {
    const products = await ProductService.getAllProducts();
    return res
      .status(200)
      .json(new ApiResponse(200, products, "Products fetched successfully"));
  }),

  getProductById: catchAsync(async (req, res) => {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);
    
    if (!product) {
      return res.status(404).json(new ApiResponse(404, null, "Product not found"));
    }
    
    return res
      .status(200)
      .json(new ApiResponse(200, product, "Product fetched successfully"));
  }),

  updateProduct: catchAsync(async (req, res) => {
    const { id } = req.params;
    const {
      product_name,
      brand,
      category,
      main_category,
      short_description,
    } = req.body;

    const generalData = {
      product_name,
      brand,
      category,
      main_category,
      short_description,
    };

    const sections = JSON.parse(req.body.sections || "[]");
    const variants = JSON.parse(req.body.variants || "[]");

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
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Product updated successfully"));
  }),

  deleteProduct: catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ProductService.deleteProduct(id);
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Product deleted successfully"));
  }),

  addToWishlist: catchAsync(async (req, res) => {
    const { productId, userId } = req.body;
    if (!productId || !userId) {
      return res.status(400).json(new ApiResponse(400, null, "Product ID and User ID are required"));
    }
    const result = await ProductService.addToWishlist(userId, productId);
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Product added to wishlist successfully"));
  }),

  removeFromWishlist: catchAsync(async (req, res) => {
    const { productId, userId } = req.body;
    if (!productId || !userId) {
      return res.status(400).json(new ApiResponse(400, null, "Product ID and User ID are required"));
    }
    const result = await ProductService.removeFromWishlist(userId, productId);
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Product removed from wishlist"));
  }),
  
  addToCart: catchAsync(async (req, res) => {
    const { productId, userId, quantity } = req.body;
    if (!productId || !userId || !quantity) {
      return res.status(400).json(new ApiResponse(400, null, "Product ID, User ID, and Quantity are required"));
    }
    const result = await ProductService.addToCart(userId, productId, quantity);
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Product added to cart successfully"));
  }),

  removeFromCart: catchAsync(async (req, res) => {
    const { productId, userId } = req.body;
    if (!productId || !userId) {
      return res.status(400).json(new ApiResponse(400, null, "Product ID and User ID are required"));
    }
    const result = await ProductService.removeFromCart(userId, productId);
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Product removed from cart"));
  }),

  getUserCart: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json(new ApiResponse(400, null, "User ID is required"));
    }
    const result = await ProductService.getUserCart(userId);
    return res
      .status(200)
      .json(new ApiResponse(200, result, "User cart fetched successfully"));
  }),

  getUserWishlist: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json(new ApiResponse(400, null, "User ID is required"));
    }
    const result = await ProductService.getUserWishlist(userId);
    return res
      .status(200)
      .json(new ApiResponse(200, result, "User wishlist fetched successfully"));
  }),

  updateCartQuantity: catchAsync(async (req, res) => {
    const { productId, userId, quantity } = req.body;
    if (!productId || !userId || quantity === undefined) {
      return res.status(400).json(new ApiResponse(400, null, "Product ID, User ID, and Quantity are required"));
    }
    const result = await ProductService.updateCartQuantity(userId, productId, quantity);
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Cart quantity updated successfully"));
  }),
  
};

module.exports = ProductController;