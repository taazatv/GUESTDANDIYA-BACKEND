const dotenv = require("dotenv");
dotenv.config();

const config = {
  DB_URL:
    process.env.URL ||
    "mongodb+srv://TAAZADANDIYA:ROHIT@01@cmongodb+srv://TAAZADANDIYA:ROHIT%4001@cluster0.xmofqnm.mongodb.net/taaza-dandiya?retryWrites=true&w=majority&appName=Cluster0luster0.xmofqnm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  PORT: process.env.PORT || 7000,
};

module.exports = config;
