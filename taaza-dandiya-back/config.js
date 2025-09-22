const dotenv = require("dotenv");
dotenv.config();

const config = {
  DB_URL:
    process.env.URL ||
    " mongodb+srv://TAAZADANDIYA:ROHIT@01@cluster0.xmofqnm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  PORT: process.env.PORT || 7000,
};

module.exports = config;
