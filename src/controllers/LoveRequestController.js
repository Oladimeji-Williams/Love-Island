const LoveRequest = require("../models/LoveRequestModel");

exports.sendLoveRequest = async (req, res) => {
    try {
        const { recipientId } = req.body;

        if (!recipientId) {
            return res.status(400).json({ message: "Recipient ID is required" });
        }

        const existingRequest = await LoveRequest.findOne({
            sender: req.user.userId,
            recipient: recipientId,
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Love request already sent" });
        }

        const loveRequest = new LoveRequest({
            sender: req.user.userId,
            recipient: recipientId,
            status: "pending",
        });

        await loveRequest.save();
        res.json({ message: "Love request sent successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.respondToLoveRequest = async (req, res) => {
    try {
        const { requestId, status } = req.body; // Request ID & New Status (accept/reject)

        if (!requestId || !["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid request or status" });
        }

        const loveRequest = await LoveRequest.findById(requestId);

        if (!loveRequest) {
            return res.status(404).json({ message: "Love request not found" });
        }

        // Ensure only the recipient can accept/reject
        if (loveRequest.recipient.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized to respond to this request" });
        }

        if (loveRequest.status !== "pending") {
            return res.status(400).json({ message: `Love request is already ${loveRequest.status}` });
        }

        loveRequest.status = status; // Update status to 'accepted' or 'rejected'
        await loveRequest.save();

        res.json({ message: `Love request ${status} successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
