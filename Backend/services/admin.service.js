const adminModel = require("../models/admin.model");

module.exports.createAdmin = async ({
  name,
  email,
  password,
  role,
}) => {
  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  return new Promise((resolve, reject) => {
    adminModel.createAdmin(
      {
        name,
        email,
        password,
        role,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

module.exports.generateAuthToken = adminModel.generateAuthToken;

module.exports.hashPassword = adminModel.hashPassword || require("bcrypt").hash;
module.exports.comparePassword = adminModel.comparePassword; 
module.exports.findAdminByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    adminModel.findAdminByEmail(email, (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return resolve(null);
      resolve(results[0]);
    });
  });
};

