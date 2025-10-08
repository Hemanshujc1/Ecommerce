const db = require("../db/mysql12");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); 

const createAdmin = async (adminData, callback) => {
  try {
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const role = adminData.role || 'admin'; // Default role is 'admin', main admin is 'main_admin'

    const sql = `
      INSERT INTO admininfo (name, email, password, role) 
      VALUES (?, ?, ?, ?)
    `;

    const values = [
      adminData.name,
      adminData.email,
      hashedPassword,
      role,
    ];

    const connection = await db.createConnection();
    const [results] = await connection.execute(sql, values);
    await connection.end();
    callback(null, results);
  } catch (error) {
    callback(error);
  }
};

const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

const generateAuthToken = (adminId) => {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};
const findAdminByEmail = async (email, callback) => {
  try {
    const sql = "SELECT * FROM admininfo WHERE email = ?";
    const connection = await db.createConnection();
    const [results] = await connection.execute(sql, [email]);
    await connection.end();
    callback(null, results);
  } catch (error) {
    callback(error);
  }
};
const getAdminById = async (id, callback) => {
  try {
    const sql = "SELECT * FROM admininfo WHERE id = ?";
    const connection = await db.createConnection();
    const [results] = await connection.execute(sql, [id]);
    await connection.end();
    callback(null, results);
  } catch (error) {
    callback(error);
  }
};




module.exports = {
    createAdmin,
  comparePassword,
  generateAuthToken,
  findAdminByEmail,
  getAdminById
};
