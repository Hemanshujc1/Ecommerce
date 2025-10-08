const { body } = require("express-validator");

const adminLoginVaidationRules = [
  body("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Please enter a valid email address"),

  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long"),
];

module.exports = adminLoginVaidationRules;
