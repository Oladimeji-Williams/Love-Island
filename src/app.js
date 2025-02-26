require("dotenv").config();
const express = require("express");

// Use relative paths with "./" instead of "/"
const userRouter = require("./routes/UserRoute");
const messageRouter = require("./routes/MessageRoute");
const giftRouter = require("./routes/GiftRoute");
const reportRouter = require("./routes/ReportRoute");

const app = express();
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/gifts", giftRouter);
app.use("/api/reports", reportRouter);

module.exports = app;
