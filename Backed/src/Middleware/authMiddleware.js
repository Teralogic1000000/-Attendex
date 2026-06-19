import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

// Wrapper to handle async middleware properly
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

const verifyToken = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch complete user data with role information
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach complete user data to request
    req.user = {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      orgId: user.orgId,
      role: user.role, // Include full role object with name
      status: user.status,
      user_type_name: user.role?.name // For backward compatibility
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
        if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(500).json({ message: "Token verification failed" });
  }
});

export default verifyToken;