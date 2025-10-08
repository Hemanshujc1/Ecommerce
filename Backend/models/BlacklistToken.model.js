const db = require("../db/mysql12");

const blacklistToken = async (token) => {
  const sql = `
    INSERT INTO blacklisted_tokens (token, expires_at) 
    VALUES (?, DATE_ADD(NOW(), INTERVAL 1 DAY))
  `;

  try {
    const connection = await db.createConnection();
    const [results] = await connection.execute(sql, [token]);
    await connection.end();
    return results;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create: blacklistToken
};
