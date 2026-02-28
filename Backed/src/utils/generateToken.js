import jwt from 'jsonwebtoken';

export default function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      orgId: user.orgId,
      roleName: user.role.name
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}