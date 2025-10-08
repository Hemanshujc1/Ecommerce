const express = require("express");
const router = express.Router();
const adminValidator = require("../validations/adminValidator");
const adminLoginValidationRules = require("../validations/adminLoginVaidationRules");
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware")

//router.get("/get-admins-data", adminValidator, adminController.getAllAdmins);

// Public routes
router.post("/login", adminLoginValidationRules, adminController.loginAdmin);

// Protected routes (require authentication)
router.get("/profile", authMiddleware.authAdmin, adminController.getAdminProfile);
router.get("/logout", authMiddleware.authAdmin, adminController.logoutAdmin);

// Main admin only routes (require main_admin role)
router.get("/getAllAdmins", authMiddleware.authAdmin, adminController.getAllAdmins);
router.post("/register", authMiddleware.authAdmin, adminValidator, adminController.registerAdmin);
router.delete("/deleteAdmin/:id", authMiddleware.authAdmin, adminController.deleteAdmin);
router.patch("/editAdmin/:id", authMiddleware.authAdmin, adminController.updateAdmin);


module.exports = router;
