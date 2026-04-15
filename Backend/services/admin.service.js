const { User } = require("../models");

module.exports.createAdmin = async ({
  name,
  email,
  password,
  role = 'admin',
}) => {
  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  // We reuse the User model for admins, but with an admin-related role
  return await User.create({
    name,
    email,
    password,
    role,
    // Provide a default username for admins if needed by the User model
    username: email.split('@')[0] + '_admin' 
  });
};

module.exports.generateAuthToken = (admin) => {
  return admin.generateAuthToken();
};

module.exports.comparePassword = async (password, adminPassword) => {
  const bcrypt = require("bcrypt");
  return await bcrypt.compare(password, adminPassword);
};

module.exports.findAdminByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};
