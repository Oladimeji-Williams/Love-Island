const isAdminMiddleware = (req, res, next) => {
    try {
        // Check if user exists and has an admin role
        if (req.user && req.user.role === "admin") {
            next(); // Allow access
        } else {
            res.status(403).json({ message: "Access denied. Admins only." });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error. Authorization failed." });
    }
};

module.exports = isAdminMiddleware;
