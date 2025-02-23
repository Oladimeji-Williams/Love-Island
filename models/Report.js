const mongoose = require("mongoose");
const User = require("./User");

const ReportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: User, require: true },
  reportee: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  reason: { type: String, required: true },
  reportedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", ReportSchema);
