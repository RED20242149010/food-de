
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  console.log("Authorization header received:", !!authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  const token = authHeader.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing");

    return res.status(500).json({
      message: "Server configuration error"
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      console.log("JWT verification error:", error.name, error.message);

      return res.status(401).json({
        message: "Invalid authentication token",
        error: error.name
      });
    }

    console.log("Token verified successfully");

    req.userId = decoded.userId;
    next();
  });
}

module.exports = authenticateToken;
