// routes/products.routes.js
const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");
const fileUpload = require("express-fileupload");

router.use(fileUpload());
const validateProductInput = (req, res, next) => {
    const { product_name, brand } = req.body;
    if (!product_name || !brand) {
      return res.status(400).json({ error: "Missing product name or brand" });
    }
    next();
  };
  
  
router.post("/add",validateProductInput, ProductController.addProduct);
router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getProductById);
router.put("/:id", validateProductInput, ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);

router.post("/wishlist/add", ProductController.addToWishlist);
router.post("/wishlist/remove", ProductController.removeFromWishlist);
router.get("/wishlist/:userId", ProductController.getUserWishlist);
router.post("/cart/add", ProductController.addToCart);
router.post("/cart/remove", ProductController.removeFromCart);
router.post("/cart/update", ProductController.updateCartQuantity);
router.get("/cart/:userId", ProductController.getUserCart);

module.exports = router;
