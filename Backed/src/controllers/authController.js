// Backed/src/controllers/authController.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken.js';

const prisma = new PrismaClient();

// ✅ Named export for register
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, orgName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const organization = await prisma.organization.create({ data: { name: orgName } });

    const role = await prisma.role.findUnique({ where: { name: "OrgAdmin" } });
    if (!role) return res.status(500).json({ message: "Roles not seeded" });

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        orgId: organization.id,
        roleId: role.id,
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "Organization registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: "OrgAdmin",
        orgId: organization.id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Named export for login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};