const userModel = require("../models/user.model");
const adminModel = require("../models/admin.model");
const jwt = require("jsonwebtoken");
const db = require("../db/mysql12");

module.exports.authUser = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.toLowerCase().startsWith("bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  //const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  let rows = [];
  try {
    const connection = await db.createConnection();
    const [results] = await connection.execute("SELECT * FROM blacklisted_tokens WHERE token = ? LIMIT 1", [token]);
    rows = results;
    await connection.end();
  } catch (err) {
    console.error("Error checking blacklisted tokens:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
  
  if (rows.length > 0) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userModel.getUserById(decoded.id, (err, results) => {
      if (err || results.length === 0) {
        return res
          .status(401)
          .json({ message: "Unauthorized: User not found" });
      }
      req.user = results[0];
      next();
    });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports.authAdmin = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.toLowerCase().startsWith("bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

if (!token) {
  return res.status(401).json({ message: "Unauthorized: No token provided" });
}

let rows = [];
try {
  const connection = await db.createConnection();
  const [results] = await connection.execute("SELECT * FROM blacklisted_tokens WHERE token = ? LIMIT 1", [token]);
  rows = results;
  await connection.end();
} catch (err) {
  console.error("Error checking blacklisted tokens:", err);
  return res.status(500).json({ message: "Internal server error" });
}

if (rows.length > 0) {
  return res.status(401).json({ message: "Unauthorized" });
}

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  adminModel.getAdminById(decoded.id, (err, results) => {
    if (err || results.length === 0) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Admin not found" });
    }
    req.admin = results[0];
    next();
  });
} catch (error) {
  return res.status(401).json({ message: "Unauthorized: Invalid token" });
}
};