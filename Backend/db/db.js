const mysql = require("mysql");


const connectToDB = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connectToDB.connect((err) => {
  if (err) {
    console.error("Failed to connect to DB:", err.message);
    return;
  }
  console.log("Connected to DB");
});

module.exports = connectToDB;

