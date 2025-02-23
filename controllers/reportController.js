const Report = require("../models/Report");

const reportUser = async (req, res) => {
  try {
    const reporter = req.user.id;
    const { reportee, reason } = req.body;

    if (!reportee || !reason) {
      return res
        .status(400)
        .json({ message: "reportee and reason are required" });
    }
    // prevent self reporting
    if (reporter === reportee) {
      return res.status(400).json({ message: "You cannot report yourself." });
    }
    // create and save a report instance
    const report = new Report({
      reporter,
      reportee,
      reason,
    });
    await report.save();
    res.status(201).json({ message: "Report submitted successfully", report });
  } catch (error) {
    console.error("Error reporting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = reportUser;
