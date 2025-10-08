const db = require("../db/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); 

const createUser = async (userData, callback) => {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const sql = `
      INSERT INTO userinfo (name, username, gender, age, email, password) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      userData.name,
      userData.username,
      userData.gender,
      userData.age,
      userData.email,
      hashedPassword,
    ];

    db.query(sql, values, callback);
  } catch (error) {
    callback(error);
  }
};

const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

const generateAuthToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};
const findUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM userinfo WHERE email = ?";
  db.query(sql, [email], callback);
};
const getUserById = (id, callback) => {
  const sql = "SELECT * FROM userinfo WHERE id = ?";
  db.query(sql, [id], callback);
};




module.exports = {
  createUser,
  comparePassword,
  generateAuthToken,
  findUserByEmail,
  getUserById
};
