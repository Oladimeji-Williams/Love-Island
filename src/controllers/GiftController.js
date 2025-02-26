const Gift = require("../models/GiftModel.js");
exports.sendGift = async (req, res) => {
  try {
    const { receiver, giftType, message } = req.body;
    const gift = new Gift({ sender: req.user.id, receiver, giftType, message });
    await gift.save();
    res.json({ message: "Gift sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReceivedGifts = async (req, res) => {
  try {
    const gifts = await Gift.find({ receiver: req.user.id });
    res.json(gifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
