import prisma from '../config/prisma.js'

export const checkIn = async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  const existing = await prisma.attendance.findFirst({
    where: {
      userId: req.user.id,
      date: today
    }
  });

  if (existing)
    return res.status(400).json({ message: "Already checked in today" });

  const attendance = await prisma.attendance.create({
    data: {
      userId: req.user.id,
      orgId: req.user.orgId,
      date: today,
      checkIn: new Date()
    }
  });

  res.status(201).json(attendance);
};

export const getAttendance = async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = {
    orgId: req.user.orgId
  };

  if (startDate && endDate) {
    filter.checkIn = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    };
  }

  const records = await prisma.attendance.findMany({
    where: filter,
    include: {
      user: true
    }
  });

  successResponse(res, "Attendance fetched", records);
};

export const checkOut = async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: req.user.id,
      date: today
    }
  });

  if (!attendance)
    return res.status(400).json({ message: "You must check in first" });

  if (attendance.checkOut)
    return res.status(400).json({ message: "Already checked out" });

  const checkOutTime = new Date();
  const diffMs = checkOutTime - attendance.checkIn;
  const hours = diffMs / (1000 * 60 * 60);

  const updated = await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      checkOut: checkOutTime,
      totalHours: parseFloat(hours.toFixed(2))
    }
  });

  res.json(updated);
};

export const getMyAttendance = async (req, res) => {
  const records = await prisma.attendance.findMany({
    where: { userId: req.user.id },
    orderBy: { date: "desc" }
  });

  res.json(records);
};

export const getOrgAttendance = async (req, res) => {
  const records = await prisma.attendance.findMany({
    where: { orgId: req.user.orgId },
    include: {
      user: {
        select: { firstName: true, lastName: true }
      }
    },
    orderBy: { date: "desc" }
  });

  res.json(records);
};