const { validationResult } = require("express-validator");
const adminService = require("../services/admin.service");
const { User, BlacklistToken } = require("../models");
const { Op } = require("sequelize");
const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");

module.exports.registerAdmin = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { name, email, password, role } = req.body;

  // Only main_admin can create new admins
  if (req.admin && req.admin.role !== 'main_admin') {
    return res.status(403).json(new ApiResponse(403, null, "Access denied. Only main admin can create new admins."));
  }

  const admin = await adminService.createAdmin({ name, email, password, role: role || 'admin' });
  const token = adminService.generateAuthToken(admin);

  return res.status(201).json(new ApiResponse(201, { token, adminId: admin.id }, "Admin registered successfully"));
});

module.exports.loginAdmin = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { email, password } = req.body;
  const admin = await adminService.findAdminByEmail(email);

  if (!admin || (admin.role !== 'admin' && admin.role !== 'main_admin')) {
    return res.status(401).json(new ApiResponse(401, null, "Invalid email or password"));
  }

  const isMatch = await adminService.comparePassword(password, admin.password);
  if (!isMatch) {
    return res.status(401).json(new ApiResponse(401, null, "Invalid email or password"));
  }

  const token = adminService.generateAuthToken(admin);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 3600000  
  });
  
  const adminData = admin.toJSON();
  delete adminData.password;
  
  return res.status(200).json(new ApiResponse(200, { token, admin: adminData }, "Login successful"));
});

module.exports.getAdminProfile = catchAsync(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.admin, "Profile fetched successfully"));
});

module.exports.getAllAdmins = catchAsync(async (req, res) => {
  if (req.admin.role !== 'main_admin') {
    return res.status(403).json(new ApiResponse(403, null, "Access denied. Only main admin can manage admins."));
  }
  
  const admins = await User.findAll({
    where: {
      role: {
        [Op.in]: ['admin', 'main_admin']
      }
    },
    attributes: ['id', 'name', 'email', 'role']
  });

  return res.status(200).json(new ApiResponse(200, admins, "Admins fetched successfully"));
});

module.exports.deleteAdmin = catchAsync(async (req, res) => {
  const adminId = req.params.id;
  if (req.admin.role !== 'main_admin') {
    return res.status(403).json(new ApiResponse(403, null, "Access denied. Only main admin can delete admins."));
  }

  if (req.admin.id == adminId) {
    return res.status(400).json(new ApiResponse(400, null, "Cannot delete your own account."));
  }

  const targetAdmin = await User.findByPk(adminId);
  if (!targetAdmin || (targetAdmin.role !== 'admin' && targetAdmin.role !== 'main_admin')) {
    return res.status(404).json(new ApiResponse(404, null, "Admin not found"));
  }

  if (targetAdmin.role === 'main_admin') {
    return res.status(400).json(new ApiResponse(400, null, "Cannot delete another main admin."));
  }

  await targetAdmin.destroy();
  return res.status(200).json(new ApiResponse(200, null, "Admin deleted successfully"));
});

module.exports.updateAdmin = catchAsync(async (req, res) => {
  const adminId = req.params.id;
  const { name, email, role } = req.body;

  if (req.admin.role !== 'main_admin') {
    return res.status(403).json(new ApiResponse(403, null, "Access denied. Only main admin can update admins."));
  }

  if (role === 'main_admin' && req.admin.id != adminId) {
    return res.status(400).json(new ApiResponse(400, null, "Cannot assign main admin role to other admins."));
  }

  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  if (role && req.admin.id == adminId) updates.role = role;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json(new ApiResponse(400, null, "No valid fields to update"));
  }

  const [updatedRowsCount] = await User.update(updates, { 
    where: { 
      id: adminId,
      role: { [Op.in]: ['admin', 'main_admin'] } 
    } 
  });

  if (updatedRowsCount === 0) {
    return res.status(404).json(new ApiResponse(404, null, "Admin not found"));
  }

  return res.status(200).json(new ApiResponse(200, null, "Admin updated successfully"));
});

module.exports.logoutAdmin = catchAsync(async (req, res) => {
  res.clearCookie('token');
  
  let token = req.cookies.token;
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (token) {
    await BlacklistToken.create({ token });
  }
  
  return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});
