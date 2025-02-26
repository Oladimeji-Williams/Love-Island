const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/UserModel.js");

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, gender } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        user = new User({
            name,
            email,
            password,
            gender
        });

        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if(user.isDeleted){
            return res.status(400).json({message: "User not found"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password Match Result:", isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



    exports.getUserProfile = async (req, res) => {
        try {
            console.log("req.user:", req.user); // Debugging
            if (!req.user || !req.user.userId) {
                return res.status(400).json({ message: "User not authenticated" });
            }
            
            const user = await User.findById(req.user.userId).select("-_id -email -password");
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            
            if(user.isDeleted){
                return res.status(404).json({message: "User not found"});
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };


exports.updateUserProfile = async (req, res) => {
    try {
        const updates = req.body; 

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            updates,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        if(updatedUser.isDeleted){
            return res.status(400).json({message: "User not found"});
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Ensure the request contains a valid authenticated user
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Unauthorized, no user found" });
        }

        // Find the user by ID
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if(user.isDeleted){
            return res.status(400).json({message: "User not found"});
        }

        // Check if the old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Always return a success message to prevent email enumeration attacks
        if (!user || user.isDeleted) {
            return res.json({ message: "If this email exists, a reset link has been sent." });
        }

        // Generate a secure token and hash it before saving
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = await bcrypt.hash(resetToken, 10);

        // Set token and expiration
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600 * 1000; // 1 hour

        await user.save();

        // Send email with reset link
        const resetLink = `https://yourapp.com/reset-password/${resetToken}`;

        // Configure and send email (Replace with real email service)
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            to: user.email,
            subject: "Password Reset Request",
            html: `<p>Click the link below to reset your password:</p>
                   <a href="${resetLink}">${resetLink}</a>
                   <p>This link will expire in 1 hour.</p>`,
        });

        res.json({ message: "If this email exists, a reset link has been sent." });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.params;

        const user = await User.findOne({ 
            resetPasswordToken: token, 
            resetPasswordExpires: { $gt: new Date() } // Check expiration
        });
        if(user.isDeleted){
            return res.status(400).json({message: "User not found"});
        };
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token." });
        };

        // Clear reset token fields
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        user.password = newPassword;

        await user.save();
        res.json({ message: "Password reset successful." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.getUsers = async (req, res) => {
    try {
        const { gender, interestedIn, hobbies, limit = 10, skip = 0 } = req.query;
        let filter = { isDeleted: false }; // Exclude soft-deleted users

        if (gender) {
            const validGenders = ["Male", "Female"];
            if (!validGenders.includes(gender)) {
                return res.status(400).json({ message: "Invalid gender value" });
            }
            filter.gender = gender;
        }

        if (interestedIn) {
            const validInterestedIn = ["Single", "Married", "Man", "Woman"];
            if (!validInterestedIn.includes(interestedIn)) {
                return res.status(400).json({ message: "Invalid interestedIn value" });
            }
            filter.interestedIn = interestedIn;
        }

        if (hobbies) {
            const hobbiesArray = hobbies ? hobbies.split(",") : [];
            if (hobbiesArray.length > 0) {
                filter.hobbies = { $in: hobbiesArray };
            }
        }

        const users = await User.find(filter)
            .select("-password") // Keep `_id`, but remove password
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.softDeleteProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if(user.isDeleted){
            return res.status(400).json({message: "User not found"});
        }

        user.isDeleted = true;
        await user.save();

        res.json({ message: "Profile deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.hardDeleteProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User permanently deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
