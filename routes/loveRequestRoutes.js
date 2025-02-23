// assumes all installs have been done on main branch and there is an authMiddleware for jwt authentication

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  sendLoveRequest,
  acceptLoveRequest,
  declineLoveRequest,
  getReceivedLoveRequests,
} = require("../controllers/loveRequestController");

// send love request
router.post("/", authMiddleware, sendLoveRequest);

router.post("/:id/accept", authMiddleware, acceptLoveRequest);

router.post("/:id/decline", authMiddleware, declineLoveRequest);

// view received love requests

router.get("/pending", authMiddleware, getReceivedLoveRequests);

module.exports = router;
