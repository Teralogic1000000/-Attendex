export default function authorizeRoles(...roles) {
  return (req, res, next) => {
    const userRole = req.user.role?.name || req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}