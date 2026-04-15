const express = require("express");
const router = express.Router();
const { SiteConfiguration } = require("../models");

router.get("/", async (req, res) => {
  try {
    const config = await SiteConfiguration.findOne({ where: { key: 'home_products' } });

    if (!config) return res.json({ sections: [] });
    res.json(config.value);
      
  } catch (error) {
    console.error("GET /home-products error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// POST or UPDATE data
router.post("/", async (req, res) => {
  const { sections } = req.body;
  try {
    const landingData = { sections };

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
