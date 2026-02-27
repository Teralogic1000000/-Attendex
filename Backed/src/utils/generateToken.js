import jwt from 'jsonwebtoken';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      orgId: user.orgId,
      roleId: user.roleId
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

export default generateToken;