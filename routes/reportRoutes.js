const express = require("express");
const router = express.Router();

const reportUser = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/report", authMiddleware, reportUser);

module.exports = router;
