const mongoose = require("mongoose");
const ReportSchema = new mongoose.Schema({
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    reason: {
      type: String,
      required: true
    }
  },
  {
    timestamp: true
  }
);
module.exports = mongoose.model("Report", ReportSchema);