const express = require("express");
const router = express.Router();
const { SiteConfiguration, Product, ProductVariant } = require("../models");

router.get("/", async (req, res) => {
  try {
    const config = await SiteConfiguration.findOne({ where: { key: 'home_products' } });

    if (!config) return res.json({ sections: [] });
    
    // Parse the sections safely
    let sections = [];
    if (config.value && config.value.sections) {
      if (typeof config.value.sections === 'string') {
        sections = JSON.parse(config.value.sections);
      } else if (Array.isArray(config.value.sections)) {
        sections = config.value.sections;
      }
    }

    // Hydrate each section's products with live database data
    for (let section of sections) {
      if (section.products && Array.isArray(section.products)) {
        const populatedProducts = [];
        for (let p of section.products) {
          if (!p.id) continue;
          
          const productDB = await Product.findByPk(p.id, {
            include: [{ model: ProductVariant, as: 'variants' }]
          });
          
          if (productDB) {
            const variant = productDB.variants && productDB.variants[0] ? productDB.variants[0] : {};
            
            populatedProducts.push({
              id: productDB.id,
              productname: productDB.product_name,
              img: variant.main_image || p.img || "",
              price: variant.price ? `₹${variant.price}` : p.price || "",
              discount: variant.discount || p.discount || 0,
            });
          }
        }
        section.products = populatedProducts;
      }
    }

    res.json({ sections });
      
  } catch (error) {
    console.error("GET /home-products error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// POST or UPDATE data
router.post("/", async (req, res) => {
  const { sections } = req.body;
  try {
    // Clean up unnecessary data to store only IDs
    const cleanedSections = (sections || []).map(section => ({
      sectionTitle: section.sectionTitle,
      id: section.id,
      products: (section.products || []).map(p => ({ id: p.id }))
    }));

    const landingData = { sections: cleanedSections };

    const [config, created] = await SiteConfiguration.findOrCreate({
      where: { key: 'home_products' },
      defaults: { value: landingData }
    });

    if (!created) {
      await config.update({ value: landingData });
    }

    res.json({ message: "Home product sections saved successfully" });
  } catch (error) {
    console.error("POST /home-products error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
