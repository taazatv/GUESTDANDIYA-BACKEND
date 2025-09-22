const dotenv = require("dotenv");
dotenv.config();

const config = {
  DB_URL:
    process.env.URL ||
    "",
  PORT: process.env.PORT || 7000,
};

module.exports = config;