const db = require("../db/mysql12");

exports.addBlog = async (req, res) => {
  const { title,short_description, description, date } = req.body;
  const image = req.file ? "/upload/blogs/" + req.file.filename : null;

  try {
    const connection = await db.createConnection();
    await connection.execute(
      "INSERT INTO blogs (title, short_description, description, date, image) VALUES (?, ?, ?, ?, ?)",
      [title, short_description, description, date, image]
    );
    await connection.end();

    res.status(201).json({ message: "Blog added successfully" });
  } catch (error) {
    console.error("Add blog error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const connection = await db.createConnection();
    const [rows] = await connection.execute("SELECT * FROM blogs ORDER BY id DESC");
    await connection.end();

    res.status(200).json(rows);
  } catch (error) {
    console.error("Get blogs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await db.createConnection();
    const [result] = await connection.execute("DELETE FROM blogs WHERE id = ?", [id]);
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
