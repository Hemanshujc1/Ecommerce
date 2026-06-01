const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const blogController = require("../controllers/blog.controller");
const { sequelize } = require("../models");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/upload/blogs");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), blogController.addBlog);
router.get("/", blogController.getAllBlogs);
router.delete("/:id", blogController.deleteBlog);

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await sequelize.query(
      "SELECT * FROM blogs WHERE id = ?",
      { replacements: [id] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // If image already includes '/upload/blogs', leave it as-is
    rows[0].image = rows[0].image?.startsWith("/upload/blogs")
      ? rows[0].image
      : `/upload/blogs/${rows[0].image}`;

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Fetch blog by ID error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title,short_description, description, date } = req.body;
  const image = req.file ? "/upload/blogs/" + req.file.filename : null;

  try {
    let query = "UPDATE blogs SET title = :title, short_description = :short_description, description = :description, date = :date";
    const replacements = { title, short_description, description, date, id };

    if (image) {
      query += ", image = :image";
      replacements.image = image;
    }

    query += " WHERE id = :id";

    await sequelize.query(query, { replacements });

    res.status(200).json({ message: "Blog updated successfully" });
  } catch (err) {
    console.error("Update blog error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
