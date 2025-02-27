const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    let url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.azz4e.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;
    await mongoose.connect(url, {});
    console.log("connection to DB successful");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
