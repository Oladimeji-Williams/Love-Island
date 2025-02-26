const Message = require("../models/MessageModel");
const LoveRequest = require("../models/LoveRequestModel");

exports.getMessages = async (req, res) => {
  try {
      const { recipientId } = req.params;

      const messages = await Message.find({
          $or: [
              { sender: req.user.userId, recipient: recipientId },
              { sender: recipientId, recipient: req.user.userId },
          ],
      }).sort({ createdAt: 1 }); // Sort by time

      res.json({ messages });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};



exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, message } = req.body;

        if (!recipientId || !message) {
            return res.status(400).json({ message: "Recipient ID and message are required" });
        }

        // Check if both users are matched
        const match = await LoveRequest.findOne({
            $or: [
                { sender: req.user.userId, recipient: recipientId, status: "accepted" },
                { sender: recipientId, recipient: req.user.userId, status: "accepted" },
            ],
        });

        if (!match) {
            return res.status(403).json({ message: "You can only message matched users" });
        }

        const newMessage = new Message({
            sender: req.user.userId,
            recipient: recipientId,
            message,
        });

        await newMessage.save();
        res.json({ message: "Message sent successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
