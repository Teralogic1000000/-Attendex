import prisma from '../config/prisma.js'

export const orgDashboard = async (req, res) => {
  try {
    const orgId = req.user.orgId

    // Get total active users in organization
    const totalUsers = await prisma.user.count({
      where: {
        orgId: orgId,
        status: 'ACTIVE'
      }
    })

    // Get total departments
    const totalDepartments = await prisma.department.count({
      where: {
        orgId: orgId,
        status: 'ACTIVE'
      }
    })

    // Get total shifts
    const totalShifts = await prisma.shift.count({
      where: {
        orgId: orgId,
        status: 'Active'
      }
    })

    // Get today's attendance
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const presentToday = await prisma.attendance.count({
      where: {
        orgId: orgId,
        date: {
          gte: today,
          lt: tomorrow
        },
        status: 'Present'
      }
    })

    const absentToday = await prisma.attendance.count({
      where: {
        orgId: orgId,
        date: {
          gte: today,
          lt: tomorrow
        },
        status: 'Absent'
      }
    })

    const lateToday = await prisma.attendance.count({
      where: {
        orgId: orgId,
        date: {
          gte: today,
          lt: tomorrow
        },
        status: 'Late'
      }
    })

    // Calculate trends (compare with yesterday)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const presentYesterday = await prisma.attendance.count({
      where: {
        orgId: orgId,
        date: {
          gte: yesterday,
          lt: today
        },
        status: 'Present'
      }
    })

    const presentChange = presentToday - presentYesterday
    const absentChange = absentToday - (await prisma.attendance.count({
      where: {
        orgId: orgId,
        date: {
          gte: yesterday,
          lt: today
        },
        status: 'Absent'
      }
    }))

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDepartments,
        totalShifts,
        presentToday,
        absentToday,
        lateToday,
        presentChange,
        absentChange
      }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics'
    })
  }
}