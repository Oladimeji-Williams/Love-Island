const express = require("express");
const mongoose = require("mongoose");
const env = require("dotenv");
const userRoutes = require("/Users/mac/dating_app_api/routes/userRoutes.js");

const app = express();

env.config();
app.use(express.json());

const conectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

conectDb();

app.use("/api/v1/", userRoutes);

app.use("/api/v1/user", reportRoutes);

app.use("/api/v1/love-request", loveRequestRoutes);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
