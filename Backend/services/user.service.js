const { User } = require("../models");

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

  // Create user using Sequelize
  return await User.create({
    name,
    username,
    gender,
    age,
    email,
    password,
  });
};

module.exports.generateAuthToken = (user) => {
  return user.generateAuthToken();
};

module.exports.comparePassword = async (password, userPassword) => {
  const bcrypt = require("bcrypt");
  return await bcrypt.compare(password, userPassword);
};

module.exports.findUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};