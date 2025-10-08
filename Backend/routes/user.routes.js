const express = require("express");
const router = express.Router();
const userValidationRules = require("../validations/userValidator");
const userLoginValidationRules = require("../validations/userLoginValidationRules");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware")


router.post("/register", userValidationRules, userController.registerUser);
router.post("/login", userLoginValidationRules, userController.loginUser);
router.get("/profile", authMiddleware.authUser, userController.getUserProfile);
router.put("/profile", authMiddleware.authUser, userController.updateUserProfile);
router.get("/logout", authMiddleware.authUser, userController.logoutUser);

router.get("/all", userController.getAllUsers);
router.patch("/block/:id", userController.toggleBlockUser);
router.post("/send-discount", userController.sendEmailToUser);


router.post("/Newsletter", userController.subscribeNewsletter);
router.get("/Newsletter", userController.getallNewsletter);
router.delete("/Newsletter/:id", userController.deleteEnquiry);

router.delete("/unsubscribe", userController.unsubscribeNewsletter);


router.post("/Enquiry", userController.Enquiry);
router.get("/Enquiry", userController.getallEnquiry);
router.delete("/Enquiry/:id", userController.deleteEnquiry);



module.exports = router;
