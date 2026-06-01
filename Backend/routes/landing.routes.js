const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { SiteConfiguration } = require("../models");

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/upload/collection/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Image Upload Route
router.post("/upload/collection", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ filename: req.file.filename });
});

// GET /landing
router.get("/landing", async (req, res) => {
  try {
    const config = await SiteConfiguration.findOne({ where: { key: 'landing_page' } });
    if (!config) return res.status(404).json({ message: "No landing page configuration found" });

    // Parse the data safely
    let data = config.value || {};
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {}
    }

    // Hydrate collections
    if (data.collections && Array.isArray(data.collections)) {
      const { Product, ProductVariant } = require("../models");
      const populatedCollections = [];
      
      for (let c of data.collections) {
        if (!c.productId) continue;
        
        const productDB = await Product.findByPk(c.productId, {
          include: [{ model: ProductVariant, as: 'variants' }]
        });
        
        if (productDB) {
          const variant = productDB.variants && productDB.variants[0] ? productDB.variants[0] : {};
          
          populatedCollections.push({
            productId: productDB.id,
            title: productDB.product_name,
            img: variant.main_image || c.img || "",
            price: variant.price ? variant.price : c.price || "",
            discount: variant.discount || c.discount || 0,
            description: productDB.short_description || c.description || "",
          });
        }
      }
      data.collections = populatedCollections;
    }

    res.json(data);
  } catch (err) {
    console.error("GET /landing error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /landing
router.post("/landing", async (req, res) => {
  const { title, description, collections } = req.body;

  try {
    // Clean up unnecessary data to store only IDs
    const cleanedCollections = (collections || []).slice(0, 10).map(c => ({
      productId: c.productId
    }));

    const landingData = {
      title,
      description,
      collections: cleanedCollections
    };

    const [config, created] = await SiteConfiguration.findOrCreate({
      where: { key: 'landing_page' },
      defaults: { value: landingData }
    });

    if (!created) {
      await config.update({ value: landingData });
    }

    res.json({ message: "Landing page configuration saved successfully" });
  } catch (err) {
    console.error("POST /landing error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
