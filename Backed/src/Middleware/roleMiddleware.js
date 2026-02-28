export default function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.roleName)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}