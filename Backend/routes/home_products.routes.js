const express = require("express");
const router = express.Router();
const db = require("../db/mysql12");

router.get("/", async (req, res) => {
  try {
    const connection = await db.createConnection();
    const [rows] = await connection.execute("SELECT sections FROM home_products WHERE id = 1");
    await connection.end();

    if (rows.length === 0) return res.json({ sections: [] });
    res.json({
        sections: JSON.parse(rows[0].sections),
      });
      
  } catch (error) {
    console.error("GET /home-products error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// POST or UPDATE data
router.post("/", async (req, res) => {
  const { sections } = req.body;
  try {
    const connection = await db.createConnection();

    const [existing] = await connection.execute("SELECT id FROM home_products WHERE id = 1");
    if (existing.length > 0) {
      await connection.execute(
        "UPDATE home_products SET sections = ?, updated_at = NOW() WHERE id = 1",
        [JSON.stringify(sections)]
      );
    } else {
      await connection.execute(
        "INSERT INTO home_products (id, sections) VALUES (1, ?)",
        [JSON.stringify(sections)]
      );
    }

    await connection.end();
    res.json({ message: "Home product sections saved successfully" });
  } catch (error) {
    console.error("POST /home-products error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
