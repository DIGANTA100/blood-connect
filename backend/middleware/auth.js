import jwt from 'jsonwebtoken';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
export const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      // Allow request to proceed without auth (for optional auth routes)
      // Routes that require auth should check req.user
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    // Invalid token - allow to proceed but user will be null
    req.user = null;
    next();
  }
};

/**
 * Require Authentication Middleware
 * Must be used after authMiddleware
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};