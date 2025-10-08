const { validationResult } = require("express-validator");
const userService = require("../services/user.service");
const blacklistTokenModel = require("../models/BlacklistToken.model");
const db = require("../db/mysql12");

module.exports.registerUser = async (req, res) => {
  // console.log("Register request received with body:", req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { name, username, gender, age, email, password } = req.body;

  try {
    const user = await userService.createUser({
      name,
      username,
      gender,
      age,
      email,
      password,
    });

    const token = userService.generateAuthToken(user.insertId);

    res.status(201).json({ token, userId: user.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.is_blocked) {
      return res
        .status(403)
        .json({
          message: "Your account has been blocked. Please contact support.",
        });
    }
    const isMatch = await userService.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = userService.generateAuthToken(user.id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 3600000,
    });

    delete user.password;
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports.getUserProfile = async (req, res) => {
  res.status(200).json(req.user);
};
module.exports.updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { fullName, username, email, age, gender, password } = req.body;

  try {
    const updates = [];
    const values = [];

    if (fullName) {
      updates.push("name = ?");
      values.push(fullName);
    }
    if (username) {
      updates.push("username = ?");
      values.push(username);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (age) {
      updates.push("age = ?");
      values.push(age);
    }
    if (gender) {
      updates.push("gender = ?");
      values.push(gender);
    }
    if (password) {
      const bcrypt = require("bcrypt");
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(userId);

    const connection = await db.createConnection();
    await connection.execute(
      `UPDATE userinfo SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
    await connection.end();

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    
    // Get token from cookies or authorization header
    let token = req.cookies.token;
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }
    
    // Only blacklist token if it exists
    if (token) {
      await blacklistTokenModel.create({ token });
    }
    
    res.status(200).json({ message: "Logged Out" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const connection = await db.createConnection();
    const [results] = await connection.execute(
      "SELECT id, name, email, is_blocked FROM userinfo"
    );
    await connection.end();
    res.json(results);
  } catch (err) {
    console.error("❌ getAllUsers DB ERROR:", err); // 👈 log actual error
    res.status(500).json({ error: err.message });
  }
};

module.exports.toggleBlockUser = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await db.createConnection();
    await connection.execute(
      "UPDATE userinfo SET is_blocked = NOT is_blocked WHERE id = ?",
      [id]
    );
    await connection.end();
    res.json({ message: "User block status updated." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const nodemailer = require("nodemailer");

module.exports.sendEmailToUser = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  // simulate response
  console.log(`Pretend email sent to ${email}`);
  res.status(200).json({ message: `Discount email sent to ${email}` });

  // Future: implement nodemailer or another provider
};




module.exports.subscribeNewsletter = async (req, res) => {
  const { name, email } = req.body;
  if (!email || !name) {
    return res.status(400).json({ message: "All  fields are required" });
  }

  try {
    const connection = await db.createConnection();
    const [existing] = await connection.execute(
      "SELECT id FROM newsletter_subscriptions WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      await connection.end();
      return res.status(409).json({ message: "Email already subscribed" });
    }

    await connection.execute(
      "INSERT INTO newsletter_subscriptions (name, email) VALUES (?, ?)",
      [name, email]
    );
    await connection.end();

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.unsubscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const connection = await db.createConnection();

    // Check if email exists
    const [existing] = await connection.execute(
      "SELECT id FROM newsletter_subscriptions WHERE email = ?",
      [email]
    );

    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ message: "Email not found in our list." });
    }

    // Delete the email from subscriptions
    await connection.execute(
      "DELETE FROM newsletter_subscriptions WHERE email = ?",
      [email]
    );

    await connection.end();
    return res.status(200).json({ message: "Unsubscribed successfully." });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};
module.exports.Enquiry = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const connection = await db.createConnection();
    await connection.execute(
      "INSERT INTO enquiries (name, email, message) VALUES (?, ?, ?)",
      [name, email, message]
    );
    await connection.end();

    res.status(201).json({ message: "Enquiry submitted successfully" });
  } catch (error) {
    console.error("Enquiry submission error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.getallEnquiry = async (req, res) => {
  try {
    const connection = await db.createConnection();
    const [rows] = await connection.execute("SELECT * FROM enquiries");
    await connection.end();

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.deleteEnquiry = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "ID is required" });
  }

  try {
    const connection = await db.createConnection();
    const [result] = await connection.execute(
      "DELETE FROM enquiries WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.end();
      return res.status(404).json({ message: "Enquiry not found" });
    }

    await connection.end();
    res.status(200).json({ message: "Enquiry deleted successfully" });
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.getallNewsletter = async (req, res) => {
  try {
    const connection = await db.createConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM newsletter_subscriptions"
    );
    await connection.end();

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.deleteNewsletter = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "ID is required" });
  }

  try {
    const connection = await db.createConnection();
    const [result] = await connection.execute(
      "DELETE FROM newsletter_subscriptions WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.end();
      return res
        .status(404)
        .json({ message: "Newsletter subscription not found" });
    }

    await connection.end();
    res
      .status(200)
      .json({ message: "Newsletter subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting newsletter subscription:", error);
    res.status(500).json({ message: "Server error" });
  }
};
