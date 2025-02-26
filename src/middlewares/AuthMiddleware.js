const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        // Check if Authorization header exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1]; // Extract token

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
            }
            req.user = decoded; // Attach decoded user data to request
            next();
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error during authentication" });
    }
};

module.exports = authMiddleware;
