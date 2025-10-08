const { validationResult } = require("express-validator");
const adminService = require("../services/admin.service");
const blacklistTokenModel = require("../models/BlacklistToken.model")
const connectToDB = require("../db/mysql12.js");


module.exports.registerAdmin = async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    // If this is a protected route (with auth middleware), check permissions
    if (req.admin && req.admin.role !== 'main_admin') {
      return res.status(403).json({ message: "Access denied. Only main admin can create new admins." });
    }

    const admin = await adminService.createAdmin({ name, email, password, role: role || 'admin' });
  
    const token = adminService.generateAuthToken(admin.insertId);
  
    res.status(201).json({ token, adminId: admin.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  
};

module.exports.loginAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const admin = await adminService.findAdminByEmail(email);

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isMatch = await adminService.comparePassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = adminService.generateAuthToken(admin.id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,  
      sameSite: 'Lax',
      maxAge: 3600000  
    });
    
    delete admin.password;
    res.status(200).json({ token, admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports.getAdminProfile = async (req, res) => {
  res.status(200).json(req.admin);
};


// module.exports.getAllAdmins = async (req, res) => {
//   try {
//      console.log("📡 GET /getAllAdmins hit");
//     const [admins] = await connectToDB.query("SELECT id, name, email FROM admininfo");
//     console.log("✅ Admins fetched:", admins);
//     res.status(200).json(admins);
//   } catch (err) {
//     console.error("Error:", err)
//     console.error("❌ Error fetching admins:", err); // See full error in terminal;
//     res.status(500).json({ message: "Failed to get admins" });
//   }
// };
// module.exports.deleteAdmin = async (req, res) => {
//   const adminId = req.params.id;
//   try {
//     //console.log("📡 DELETE /delete/:id hit with ID:", adminId);
//     const [result] = await connectToDB.query("DELETE FROM admininfo WHERE id = ?", [adminId]);
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Admin not found" });
//     }
//     //console.log("✅ Admin deleted with ID:", adminId);
//     res.status(200).json({ message: "Admin deleted successfully" });
//   } catch (err) {
//     console.error("Error", err);
//     res.status(500).json({ message: "Failed to delete admin" });
//   }
// }   


module.exports.getAllAdmins = async (req, res) => {
  try {
    // Check if the requesting admin is main_admin
    if (req.admin.role !== 'main_admin') {
      return res.status(403).json({ message: "Access denied. Only main admin can manage admins." });
    }
    
    const connection = await connectToDB.createConnection();
    const [admins] = await connection.query("SELECT id, name, email, role FROM admininfo");
    await connection.end();

    res.status(200).json(admins);
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ message: "Failed to get admins" });
  }
};

module.exports.deleteAdmin = async (req, res) => {
  const adminId = req.params.id;
  try {
    // Check if the requesting admin is main_admin
    if (req.admin.role !== 'main_admin') {
      return res.status(403).json({ message: "Access denied. Only main admin can delete admins." });
    }

    // Prevent main admin from deleting themselves
    if (req.admin.id == adminId) {
      return res.status(400).json({ message: "Cannot delete your own account." });
    }

    const connection = await connectToDB.createConnection();
    
    // Check if trying to delete another main admin
    const [targetAdmin] = await connection.query("SELECT role FROM admininfo WHERE id = ?", [adminId]);
    if (targetAdmin.length > 0 && targetAdmin[0].role === 'main_admin') {
      await connection.end();
      return res.status(400).json({ message: "Cannot delete another main admin." });
    }

    const [result] = await connection.query("DELETE FROM admininfo WHERE id = ?", [adminId]);
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ message: "Failed to delete admin" });
  }
};

module.exports.updateAdmin = async (req, res) => {
  const adminId = req.params.id;
  const { name, email, role } = req.body;

  try {
    // Check if the requesting admin is main_admin
    if (req.admin.role !== 'main_admin') {
      return res.status(403).json({ message: "Access denied. Only main admin can update admins." });
    }

    // Prevent changing role of main admin or making multiple main admins
    if (role === 'main_admin' && req.admin.id != adminId) {
      return res.status(400).json({ message: "Cannot assign main admin role to other admins." });
    }

    const connection = await connectToDB.createConnection();
    
    // Build dynamic query based on provided fields
    const updates = [];
    const values = [];
    
    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (role && req.admin.id == adminId) { // Only allow self role change for main admin
      updates.push("role = ?");
      values.push(role);
    }
    
    if (updates.length === 0) {
      await connection.end();
      return res.status(400).json({ message: "No valid fields to update" });
    }
    
    values.push(adminId);
    
    const [update] = await connection.query(
      `UPDATE admininfo SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
    await connection.end();

    if (update.affectedRows === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin updated successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Failed to update admin" });
  }
};



// module.exports.updateAdmin = async (req, res) => {
//   const adminId = req.params.id;
//   const { name, email } = req.body;

//   try {
//     //console.log("📡 PATCH /editAdmin/:id hit with ID:", adminId);
//     const [update] = await connectToDB.query(
//       `UPDATE admininfo SET name = ?, email = ? WHERE id = ?`,
//       [name, email, adminId]
//     );

//     if (update.affectedRows === 0) {
//       return res.status(404).json({ message: "Admin not found" });
//     }

//    // console.log("✅ Admin updated with ID:", adminId);
//     res.status(200).json({ message: "Admin updated successfully" });
//   } catch (err) {
//     console.error("Error:", err);
//     res.status(500).json({ message: "Failed to update admin" });
//   }
// };

module.exports.logoutAdmin = async (req, res) => {
  try {
    res.clearCookie('token');
    
    // Get token from cookies or authorization header
    let token = req.cookies.token;
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Only blacklist token if it exists
    if (token) {
      await blacklistTokenModel.create({ token });
    }
    
    res.status(200).json({ message: "Logged Out" });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};


