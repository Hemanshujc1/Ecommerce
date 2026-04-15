/**
 * Script to create admin users
 * Usage:
 *   node scripts/create-admin.js                         (interactive prompts)
 *   node scripts/create-admin.js main_admin              (create main_admin role)
 *   node scripts/create-admin.js admin                   (create regular admin)
 */

require("dotenv").config();
const readline = require("readline");
const bcrypt = require("bcrypt");
const { sequelize } = require("../config/database");
const { User } = require("../models");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  await sequelize.authenticate();
  console.log("\n✅ Connected to database\n");

  const role = process.argv[2] || (await ask("Role (admin / main_admin) [admin]: ")) || "admin";

  if (!["admin", "main_admin"].includes(role)) {
    console.error("❌ Invalid role. Must be 'admin' or 'main_admin'.");
    process.exit(1);
  }

  const name     = await ask("Name: ");
  const email    = await ask("Email: ");
  const password = await ask("Password (min 5 chars): ");

  if (!name || !email || !password) {
    console.error("❌ All fields are required.");
    process.exit(1);
  }

  if (password.length < 5) {
    console.error("❌ Password must be at least 5 characters.");
    process.exit(1);
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.error(`❌ A user with email "${email}" already exists.`);
    process.exit(1);
  }

  const hashed  = await bcrypt.hash(password, 10);
  const username = email.split("@")[0] + "_admin";

  const admin = await User.create({
    name,
    email,
    password: hashed,
    role,
    username,
    gender: null,
    age: null,
  }, { hooks: false }); // skip beforeCreate hook since we already hashed

  console.log(`\n✅ ${role === "main_admin" ? "Main Admin" : "Admin"} created successfully!`);
  console.log(`   ID    : ${admin.id}`);
  console.log(`   Name  : ${admin.name}`);
  console.log(`   Email : ${admin.email}`);
  console.log(`   Role  : ${admin.role}\n`);
}

main()
  .catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  })
  .finally(() => {
    rl.close();
    sequelize.close();
  });
