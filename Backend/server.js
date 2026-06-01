const http = require("http");
const app = require("./app");
const port = process.env.PORT || 4000;
const server = http.createServer(app);

const { sequelize } = require("./models");

// Sync the database (creates tables if they don't exist based on models)
sequelize.sync().then(() => {
  console.log("Database & tables synced");
  server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}).catch(err => {
  console.error("Unable to sync database:", err);
});
