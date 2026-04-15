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

    res.json(config.value);
  } catch (err) {
    console.error("GET /landing error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /landing
router.post("/landing", async (req, res) => {
  const { title, description, collections } = req.body;

  try {
    const landingData = {
      title,
      description,
      collections: collections.slice(0, 10)
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
