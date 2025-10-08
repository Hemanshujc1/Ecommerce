// const userAdmin = require("./models/admin.model");
// const userModel = require("./models/user.model");
// const connectToDB = require("./db/db");

const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();

const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const landingRoutes = require("./routes/landing.routes.js");
const homeProductsRoutes = require("./routes/home_products.routes");
const blogRoutes = require("./routes/blog.routes");
const productsRoutes = require("./routes/products.routes");
const userInteractionRoutes = require("./routes/userInteraction.routes");
const orderRoutes = require("./routes/order.routes");


app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/users", userRoutes);
app.use("/admins", adminRoutes);

const db = require("./db/mysql12"); 

app.get("/social-links", async (req, res) => {
  try {
    const connection = await db.createConnection();
    const [rows] = await connection.execute("SELECT instagram, twitter, facebook, linkedin, whatsapp, youtube FROM social_links WHERE id = 1");
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ error: "Social links not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("GET error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/social-links", async (req, res) => {
  const { instagram, twitter, facebook, linkedin, youtube, whatsapp } = req.body;
  try {
    const connection = await db.createConnection();
    const [result] = await connection.execute(
      `UPDATE social_links SET 
        instagram = ?, 
        twitter = ?, 
        facebook = ?, 
        linkedin = ?, 
        youtube = ?, 
        whatsapp = ?,
        updated_at = NOW()
       WHERE id = 1`,
      [instagram, twitter, facebook, linkedin, youtube, whatsapp]
    );
    await connection.end();
    res.status(200).json({ message: "Social links updated successfully" });
  } catch (error) {
    console.error("PUT error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.use("/upload/collection", express.static("public/upload/collection"));
app.use("/upload", landingRoutes); 
app.use("/", landingRoutes); 
app.use("/home-products", homeProductsRoutes);

// Serve product images from the old location for backward compatibility
app.use("/products", express.static("public/products"));

app.use("/blogs", blogRoutes);
app.use("/upload", express.static("public/upload"));


app.use("/products",productsRoutes)
app.use("/interactions", userInteractionRoutes);
app.use("/orders", orderRoutes);



module.exports = app;
