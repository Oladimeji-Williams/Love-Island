const express = require("express");
const { sendGift, getReceivedGifts } = require("../controllers/GiftController.js");
const authMiddleware = require("../middlewares/AuthMiddleware.js");
const GiftRouter = express.Router();

GiftRouter.post("/send", authMiddleware, sendGift);
GiftRouter.get("/received", authMiddleware, getReceivedGifts);
module.exports = GiftRouter;