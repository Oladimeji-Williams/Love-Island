const express = require("express");
const { reportUser } = require("../controllers/ReportController.js");
const authMiddleware = require("../middlewares/AuthMiddleware.js");
const ReportRouter = express.Router();

ReportRouter.post("/report-user", authMiddleware, reportUser);

module.exports = ReportRouter;