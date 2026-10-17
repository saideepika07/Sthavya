import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getJwtSecret = () => process.env.JWT_SECRET || "sthavyaspaces_jwt_dev_secret_fallback_key";

/**
 * Extracts JWT token from httpOnly cookie or Authorization Bearer header
 */
const extractToken = (req) => {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

/**
 * Required Authentication Middleware
 * Checks httpOnly cookie or Bearer header for valid JWT
 */
export const requireAuth = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please sign in to continue.",
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found or has been revoked.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid token. Please log in again.",
      error: error.message,
    });
  }
};

/**
 * Optional Authentication Middleware
 * Populates req.user if valid token is provided, otherwise proceeds as guest
 */
export const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select("-password");
    req.user = user || null;
  } catch {
    req.user = null;
  }

  next();
};

/**
 * Role-Based Access Control Middleware
 * Usage: authorizeRoles("admin", "architect")
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Authentication is required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${roles.join(", ")}] roles. Your role is '${req.user.role}'.`,
      });
    }

    next();
  };
};

// Aliases for convenience
export const requireAdmin = authorizeRoles("admin");
export const requireArchitect = authorizeRoles("architect", "admin");
export const requireWorker = authorizeRoles("worker", "architect", "admin");

export default { requireAuth, optionalAuth, authorizeRoles, requireAdmin };
