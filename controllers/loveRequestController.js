const LoveRequest = require("../models/LoveRequest");

const sendLoveRequest = async (req, res) => {
  try {
    const sender = req.user.id;
    const { receiver } = req.body;

    if (!receiver) {
      return res.status(400).json({ message: "Receiver id is required." });
    }

    if (sender === receiver) {
      return res
        .status(400)
        .json({ message: "You cannot send a love request to yourself." });
    }
    // check for pending or accepted love request between the two users
    const existingRequest = await LoveRequest.findOne({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
      status: { $in: ["pending", "accepted"] },
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A pending or accepted love request already exists" });
    }

    const loveRequest = new LoveRequest({ sender, receiver });
    await loveRequest.save();

    res
      .status(201)
      .json({ message: "Love request sent successfully", loveRequest });
  } catch (error) {
    console.error("Error sending love request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const acceptLoveRequest = async (req, res) => {
  try {
    const reqId = req.params.id;
    const userId = req.user.id;

    const loveRequest = await LoveRequest.findById(reqId);
    if (!loveRequest) {
      return res.status(404).json({ message: "Love request not found." });
    }

    // Restriction to allow only the receiver to accept a love request
    if (loveRequest.receiver.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to decline this love request.",
      });
    }

    if (loveRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This love request has already been responded to." });
    }

    loveRequest.status = "accepted";
    await loveRequest.save();
    res
      .status(200)
      .json({ message: "Love request accepted successfully", loveRequest });
  } catch (error) {
    console.error("Error accepting love request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const declineLoveRequest = async (req, res) => {
  try {
    const reqId = req.params.id;
    const userId = req.user.id;

    const loveRequest = await LoveRequest.findById(reqId);
    if (!loveRequest) {
      return res.status(404).json({ message: "Love request not found." });
    }

    // make sure only request receiver can decline request
    if (loveRequest.receiver.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to decline this love request.",
      });
    }

    if (loveRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This love request has already been responded to." });
    }

    loveRequest.status = "declined";
    await loveRequest.save();

    res
      .status(200)
      .json({ message: "Love request declined successfully", loveRequest });
  } catch (error) {
    console.error("Error declining love request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getReceivedLoveRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // find pending love requests where current user is the receiver
    const loveRequests = await LoveRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "username, email");

    res.status(200).json({ loveRequests });
  } catch (error) {
    console.error("Error fetching pending love requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendLoveRequest,
  acceptLoveRequest,
  declineLoveRequest,
  getReceivedLoveRequests,
};
