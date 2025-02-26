const User = require("../models/UserModel.js")

const cleanExpiredResetTokens = async () => {
    try {
        await User.updateMany(
            { resetPasswordExpires: { $lt: new Date() } },
            { $set: { resetPasswordToken: null, resetPasswordExpires: null } }
        );
        console.log("Expired tokens cleared.");
    } catch (error) {
        console.error("Error cleaning expired reset tokens:", error.message);
    }
};

// Run cleanup every 10 minutes
const startTokenCleanup = () => {
    setInterval(cleanExpiredResetTokens, 10 * 60 * 1000);
    console.log("token cleanup is in operation");
};

// Export function to start cleanup
module.exports = startTokenCleanup;
