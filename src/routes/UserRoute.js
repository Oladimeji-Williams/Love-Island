const express = require("express");
const UserRouter = express.Router();
const authMiddleware = require("../middlewares/AuthMiddleware.js"); // Authentication middleware
const isAdminMiddleware = require("../middlewares/IsAdminMiddleware.js"); // Admin authorization middleware

const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    getUsers,
    softDeleteProfile,
    hardDeleteProfile
} = require("../controllers/UserController.js");

// Public Routes (No authentication needed)
UserRouter.post("/register", registerUser);
UserRouter.post("/login", loginUser);
UserRouter.post("/forgot-password", forgotPassword);
UserRouter.post("/reset-password", resetPassword);

// Protected Routes (Require authentication)
UserRouter.get("/profile", authMiddleware, getUserProfile);
UserRouter.patch("/profile", authMiddleware, updateUserProfile);
UserRouter.patch("/change-password", authMiddleware, changePassword);
UserRouter.get("/users", authMiddleware, getUsers);
UserRouter.patch("/soft-delete", authMiddleware, softDeleteProfile);


// Admin-Only Routes (Require authentication & admin privileges)
UserRouter.delete("/hard-delete/:id", authMiddleware, isAdminMiddleware, hardDeleteProfile);

module.exports = UserRouter;
