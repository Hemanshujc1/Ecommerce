const { sequelize } = require("../models");

exports.addBlog = async (req, res) => {
  const { title,short_description, description, date } = req.body;
  const image = req.file ? "/upload/blogs/" + req.file.filename : null;

  try {
    await sequelize.query(
      "INSERT INTO blogs (title, short_description, description, date, image) VALUES (?, ?, ?, ?, ?)",
      { replacements: [title, short_description, description, date, image] }
    );

    res.status(201).json({ message: "Blog added successfully" });
  } catch (error) {
    console.error("Add blog error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const [rows] = await sequelize.query("SELECT * FROM blogs ORDER BY id DESC");

    res.status(200).json(rows);
  } catch (error) {
    console.error("Get blogs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await sequelize.query("DELETE FROM blogs WHERE id = ?", { replacements: [id] });

    // In sequelize raw delete queries with mysql, result can vary but usually we don't strict check affectedRows unless needed
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
