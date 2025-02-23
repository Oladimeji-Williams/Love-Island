// This assumes there is an existing User model
const User = require("../models/User");

// Delete user account
const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
