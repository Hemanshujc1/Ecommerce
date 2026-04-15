const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { SiteConfiguration } = require("./models");
const globalErrorHandler = require("./middlewares/error.middleware");
const catchAsync = require("./utils/catchAsync");
const ApiResponse = require("./utils/ApiResponse");

// Routes
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const landingRoutes = require("./routes/landing.routes.js");
const homeProductsRoutes = require("./routes/home_products.routes");
const blogRoutes = require("./routes/blog.routes");
const productsRoutes = require("./routes/products.routes");
const userInteractionRoutes = require("./routes/userInteraction.routes");
const orderRoutes = require("./routes/order.routes");

// 1. GLOBAL MIDDLEWARES

// Security Headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000, // limit each IP to 1000 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/users", limiter);
app.use("/admins", limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 2. STATIC FILES
app.use("/upload/collection", express.static("public/upload/collection"));
app.use("/upload", express.static("public/upload"));
app.use("/products", express.static("public/products"));
app.use("/blogs", express.static("public/upload")); // Adjust if blogs are elsewhere

// 3. ROUTES
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/users", userRoutes);
app.use("/admins", adminRoutes);

// Social Links (Refactored to use catchAsync and ApiResponse)
app.get("/social-links", catchAsync(async (req, res) => {
  const config = await SiteConfiguration.findOne({ where: { key: 'social_links' } });
  if (!config) {
    return res.json(new ApiResponse(200, { instagram: "", twitter: "", facebook: "", linkedin: "", youtube: "", whatsapp: "" }));
  }
  res.json(new ApiResponse(200, config.value));
}));

app.put("/social-links", catchAsync(async (req, res) => {
  const { instagram, twitter, facebook, linkedin, youtube, whatsapp } = req.body;
  const [config, created] = await SiteConfiguration.findOrCreate({
    where: { key: 'social_links' },
    defaults: { 
      value: { instagram, twitter, facebook, linkedin, youtube, whatsapp } 
    }
  });

  if (!created) {
    await config.update({ 
      value: { instagram, twitter, facebook, linkedin, youtube, whatsapp } 
    });
  }

  res.status(200).json(new ApiResponse(200, null, "Social links updated successfully"));
}));

app.use("/home-products", homeProductsRoutes);
app.use("/products", productsRoutes);
app.use("/blogs", blogRoutes);
app.use("/interactions", userInteractionRoutes);
app.use("/orders", orderRoutes);

// Landing Routes handle multiple paths
app.use("/", landingRoutes);

// 4. ERROR HANDLING
app.use(globalErrorHandler);

module.exports = app;
