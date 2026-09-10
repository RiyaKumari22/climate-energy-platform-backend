
const jwt = require("jsonwebtoken");

// =====================================================
// Verify JWT Token
// =====================================================

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check Authorization header
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Extract token
    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Validate token payload
    if (
      !decoded.userId ||
      !decoded.email ||
      !decoded.role
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // Only allow known roles
    const validRoles = [
      "ADMIN",
      "SUPER_ADMIN",
    ];

    if (!validRoles.includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: "Invalid user role",
      });
    }

    // Attach authenticated user
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// =====================================================
// Check User Role
// =====================================================

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Authentication check
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Authorization check
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

// =====================================================
// Export Middleware
// =====================================================

module.exports = {
  authenticate,
  authorize,
};