const express = require("express");
const { sendMessage, getMessages } = require("../controllers/MessageController.js");
const authMiddleware = require("../middlewares/AuthMiddleware.js");
const MessageRouter = express.Router();

MessageRouter.post("/send", authMiddleware, sendMessage);
MessageRouter.get("/conversation/:userId", authMiddleware, getMessages);

module.exports = MessageRouter;