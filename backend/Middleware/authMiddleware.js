const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ========================================
// AUTHENTICATE USER
// ========================================

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication token is missing",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server configuration error",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get the actual user from MongoDB.
    const user = await User.findById(decoded.userId)
      .select("-password")
      .exec();

    if (!user) {
      return res.status(401).json({
        message: "User not found. Please log in again.",
      });
    }

    req.user = user;
    req.userId = user._id.toString();

    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        message:
          error.name === "TokenExpiredError"
            ? "Session expired. Please log in again."
            : "Invalid authentication token",
      });
    }

    console.error("AUTHENTICATION ERROR:", error.message);

    return res.status(500).json({
      message: "Authentication error",
    });
  }
}

// ========================================
// AUTHORIZE ADMIN
// ========================================

function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin permission required.",
    });
  }

  next();
}

module.exports = {
  authenticateToken,
  authorizeAdmin,
};