/**
 * Role-Based Access Control Middleware
 * Supports both old (role.name) and new (user_type_name) role systems
 */
export default function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    // Get user role from multiple possible sources
    const userRole = 
      req.user?.user_type_name ||  // New system: user_type_name from view
      req.user?.role?.name ||       // Old system: role.name object
      req.user?.role ||             // Old system: role string
      req.user?.userType;           // Alternative naming

    if (!userRole) {
      return res.status(401).json({ 
        message: "User role not found",
        error: 'UNAUTHORIZED'
      });
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`,
        error: 'FORBIDDEN',
        requiredRoles: allowedRoles,
        userRole: userRole
      });
    }

    next();
  };
}