const { validationResult } = require("express-validator");
const userService = require("../services/user.service");
const { User, BlacklistToken, Lead } = require("../models");
const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");

module.exports.registerUser = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { name, username, gender, age, email, password } = req.body;

  const user = await userService.createUser({
    name,
    username,
    gender,
    age,
    email,
    password,
  });

  const token = userService.generateAuthToken(user);
  return res.status(201).json(new ApiResponse(201, { token, userId: user.id }, "User registered successfully"));
});

module.exports.loginUser = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { email, password } = req.body;
  const user = await userService.findUserByEmail(email);

  if (!user) {
    return res.status(401).json(new ApiResponse(401, null, "Invalid email or password"));
  }

  if (user.is_blocked) {
    return res.status(403).json(new ApiResponse(403, null, "Your account has been blocked. Please contact support."));
  }

  const isMatch = await userService.comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(401).json(new ApiResponse(401, null, "Invalid email or password"));
  }

  const token = userService.generateAuthToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "Lax",
    maxAge: 3600000,
  });

  const userData = user.toJSON();
  delete userData.password;
  return res.status(200).json(new ApiResponse(200, { token, user: userData }, "Login successful"));
});

module.exports.getUserProfile = catchAsync(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Profile fetched successfully"));
});

module.exports.updateUserProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { fullName, username, email, age, gender, password } = req.body;

  const updates = {};
  if (fullName) updates.name = fullName;
  if (username) updates.username = username;
  if (email) updates.email = email;
  if (age) updates.age = age;
  if (gender) updates.gender = gender;
  
  if (password) {
    const bcrypt = require("bcrypt");
    updates.password = await bcrypt.hash(password, 10);
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json(new ApiResponse(400, null, "No fields to update"));
  }

  await User.update(updates, { where: { id: userId } });
  return res.status(200).json(new ApiResponse(200, null, "Profile updated successfully"));
});

module.exports.logoutUser = catchAsync(async (req, res) => {
  res.clearCookie("token");
  
  let token = req.cookies.token;
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }
  
  if (token) {
    await BlacklistToken.create({ token });
  }
  
  return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

module.exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.findAll({
    attributes: ['id', 'name', 'email', 'is_blocked', 'role']
  });
  return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

module.exports.toggleBlockUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json(new ApiResponse(404, null, "User not found"));

  user.is_blocked = !user.is_blocked;
  await user.save();
  
  return res.status(200).json(new ApiResponse(200, null, "User block status updated"));
});

module.exports.sendEmailToUser = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json(new ApiResponse(400, null, "Email is required"));

  console.log(`Pretend email sent to ${email}`);
  return res.status(200).json(new ApiResponse(200, null, `Discount email sent to ${email}`));
});

// Unified Leads (Newsletter)
module.exports.subscribeNewsletter = catchAsync(async (req, res) => {
  const { name, email } = req.body;
  if (!email || !name) {
    return res.status(400).json(new ApiResponse(400, null, "All fields are required"));
  }

  const [lead, created] = await Lead.findOrCreate({
    where: { email, type: 'newsletter' },
    defaults: { name, email, type: 'newsletter' }
  });

  if (!created) {
    return res.status(409).json(new ApiResponse(409, null, "Email already subscribed"));
  }

  return res.status(201).json(new ApiResponse(201, null, "Subscribed successfully"));
});

module.exports.unsubscribeNewsletter = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json(new ApiResponse(400, null, "Email is required"));
  }

  const deleted = await Lead.destroy({ where: { email, type: 'newsletter' } });

  if (deleted === 0) {
    return res.status(404).json(new ApiResponse(404, null, "Email not found in our list."));
  }

  return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
});

// Unified Leads (Enquiry)
module.exports.Enquiry = catchAsync(async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json(new ApiResponse(400, null, "All fields are required"));
  }

  await Lead.create({ name, email, message, type: 'enquiry' });
  return res.status(201).json(new ApiResponse(201, null, "Enquiry submitted successfully"));
});

module.exports.getallEnquiry = catchAsync(async (req, res) => {
  const enquiries = await Lead.findAll({ where: { type: 'enquiry' } });
  return res.status(200).json(new ApiResponse(200, enquiries, "Enquiries fetched successfully"));
});

module.exports.deleteEnquiry = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json(new ApiResponse(400, null, "ID is required"));

  const deleted = await Lead.destroy({ where: { id, type: 'enquiry' } });

  if (deleted === 0) {
    return res.status(404).json(new ApiResponse(404, null, "Enquiry not found"));
  }

  return res.status(200).json(new ApiResponse(200, null, "Enquiry deleted successfully"));
});

module.exports.getallNewsletter = catchAsync(async (req, res) => {
  const newsletters = await Lead.findAll({ where: { type: 'newsletter' } });
  return res.status(200).json(new ApiResponse(200, newsletters, "Newsletters fetched successfully"));
});

module.exports.deleteNewsletter = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json(new ApiResponse(400, null, "ID is required"));

  const deleted = await Lead.destroy({ where: { id, type: 'newsletter' } });

  if (deleted === 0) {
    return res.status(404).json(new ApiResponse(404, null, "Newsletter subscription not found"));
  }

  return res.status(200).json(new ApiResponse(200, null, "Newsletter subscription deleted successfully"));
});
