const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../db/mysql12");

// ✅ Serve static files (backend/public/upload/collection)
router.use("/upload", express.static(path.join(__dirname, "../public/upload")));

// ✅ Multer setup for image upload
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

// ✅ Image Upload Route
router.post("/upload/collection", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ filename: req.file.filename });
});

// ✅ GET /landing
router.get("/landing", async (req, res) => {
  try {
    const connection = await db.createConnection();

    const [landing] = await connection.execute("SELECT * FROM landing_page LIMIT 1");
    if (landing.length === 0) return res.status(404).json({ message: "No landing page found" });

    const [collections] = await connection.execute(
      "SELECT * FROM collections WHERE landing_id = ?",
      [landing[0].id]
    );

    await connection.end();

    res.json({
      title: landing[0].title,
      description: landing[0].description,
      collections,
    });
  } catch (err) {
    console.error("GET /landing error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST /landing
router.post("/landing", async (req, res) => {
  const { title, description, collections } = req.body;

  try {
    const connection = await db.createConnection();

    // clear previous
    await connection.execute("DELETE FROM landing_page");
    await connection.execute("DELETE FROM collections");

    // insert landing
    const [result] = await connection.execute(
      "INSERT INTO landing_page (title, description) VALUES (?, ?)",
      [title, description]
    );
    const landingId = result.insertId;

    // insert collections (up to 6)
    for (const col of collections.slice(0, 10)) {
      await connection.execute(
        "INSERT INTO collections (landing_id, title, description, img) VALUES (?, ?, ?, ?)",
        [landingId, col.title, col.description, col.img]
      );
    }

    await connection.end();
    res.json({ message: "Saved successfully" });
  } catch (err) {
    console.error("POST /landing error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
