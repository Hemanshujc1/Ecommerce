const { body } = require("express-validator");

const userValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),

  body("username")
    .trim()
    .toLowerCase()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),

  body("gender")
    .trim()
    .notEmpty()
    .withMessage("Gender is required"),

  body("age")
    .isInt({ min: 1 })
    .withMessage("Age must be a valid number"),

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

module.exports = userValidationRules;
