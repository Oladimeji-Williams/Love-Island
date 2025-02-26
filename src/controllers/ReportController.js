const Report = require("../models/ReportModel.js");
exports.reportUser = async (req, res) => {
  try {
    const { reportedUser, reason } = req.body;
    const report = new Report({ reporter: req.user.id, reportedUser, reason });
    await report.save();
    res.json({ message: "User reported successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
