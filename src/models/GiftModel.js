const mongoose = require("mongoose");
const GiftSchema = new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    giftType: {
      type: [String],
      enum: ["Car", "Bicycle", "House", "Food"],
      required: true
    },
    message: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
  },
  {
    timestamps: true
  }
);
  
  module.exports = mongoose.model("Gift", GiftSchema);
