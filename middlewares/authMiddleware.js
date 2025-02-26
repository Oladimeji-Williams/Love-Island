const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const env = require('dotenv');

env.config();

exports.protectRoutes = async (req, res, next) => {
    try {
        let token; 

        // Extract token from Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } 

        // Check if token exists
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        console.log("Decoded token:", decoded);

        // Fetch user from database
        const user = await User.findById(decoded.id); // 
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Attach user object to request
        req.user = user;
        console.log("Logged-in User:", req.user);
        next();
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};