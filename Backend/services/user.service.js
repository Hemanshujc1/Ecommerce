const userModel = require("../models/user.model");

module.exports.createUser = async ({
  name,
  username,
  age,
  gender,
  email,
  password,
}) => {
  if (!name || !username || !age || !gender || !email || !password) {
    throw new Error("All fields are required");
  }

  return new Promise((resolve, reject) => {
    userModel.createUser(
      {
        name,
        username,
        gender,
        age,
        email,
        password,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

module.exports.generateAuthToken = userModel.generateAuthToken;

module.exports.hashPassword = userModel.hashPassword || require("bcrypt").hash;
module.exports.comparePassword = userModel.comparePassword; 
module.exports.findUserByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    userModel.findUserByEmail(email, (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return resolve(null);
      resolve(results[0]);
    });
  });
};