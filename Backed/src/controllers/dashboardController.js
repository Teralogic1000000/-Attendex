import prisma from '../config/prisma.js'
export const orgDashboard = async (req, res) => {
  const totalEmployees = await prisma.user.count({
    where: {
      orgId: req.user.orgId,
      role: { name: "Employee" }
    }
  });

  const today = new Date();
  today.setHours(0,0,0,0);

  const todayAttendance = await prisma.attendance.count({
    where: {
      orgId: req.user.orgId,
      date: today
    }
  });

  const totalHours = await prisma.attendance.aggregate({
    where: { orgId: req.user.orgId },
    _sum: { totalHours: true }
  });

  res.json({
    totalEmployees,
    todayAttendance,
    totalWorkHours: totalHours._sum.totalHours || 0
  });
};