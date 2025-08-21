require("dotenv").config();
const userName = encodeURIComponent(process.env.JWT_USER);
const password = encodeURIComponent(process.env.JWT_PWD);

const mongoose = require("mongoose");
const { logger } = require("../utils/logger");

const connectDatabase = () => {
  mongoose
    .connect(
      `mongodb+srv://${userName}:${password}@appadvisor.uohjdvt.mongodb.net/appadvisor?retryWrites=true&w=majority&appName=Appadvisor`
    )
    .then((con) => {
      logger.info(
        `MongoDB Database Connected with Host: ${con.connection.host}`
      );
    })
    .catch((err) => {
      logger.info("Connection Error => ", err.message);
      process.exit(1);
    });
};

module.exports = connectDatabase;
