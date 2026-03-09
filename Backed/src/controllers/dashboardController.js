import { count, findMany } from '../config/supabaseMapper.js'

export const orgDashboard = async (req, res) => {
  try {
    const orgId = req.user.orgId

    // Get total active users in organization
    const totalUsers = await count('user', { orgId, status: 'ACTIVE' })

    // Get total departments
    const totalDepartments = await count('department', { orgId, status: 'ACTIVE' })

    // Get total shifts (NOTE: Shift table may not exist in new schema)
    let totalShifts = 0
    try {
      totalShifts = await count('shift', { orgId, status: 'Active' })
    } catch (error) {
      console.warn('Shift query failed - shift table may not exist in schema')
    }

    // Get today's attendance
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Fetch all attendance records for today (client-side filtering due to date complexity)
    const todayAttendances = await findMany('attendance', { orgId }, { limit: 10000 })
    const todayRecords = todayAttendances.filter(record => {
      const recordDate = new Date(record.checkInTime || record.createdAt)
      recordDate.setHours(0, 0, 0, 0)
      return recordDate.getTime() === today.getTime()
    })

    // Get yesterday's attendance for comparison
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const yesterdayAttendances = await findMany('attendance', { orgId }, { limit: 10000 })
    const yesterdayRecords = yesterdayAttendances.filter(record => {
      const recordDate = new Date(record.checkInTime || record.createdAt)
      recordDate.setHours(0, 0, 0, 0)
      return recordDate.getTime() === yesterday.getTime()
    })

    // Map status codes to counts (assuming statusId 1=Present, 2=Absent, 3=Late)
    const presentToday = todayRecords.filter(r => r.statusId === 1).length
    const absentToday = todayRecords.filter(r => r.statusId === 2).length
    const lateToday = todayRecords.filter(r => r.statusId === 3).length

    const presentYesterday = yesterdayRecords.filter(r => r.statusId === 1).length
    const absentYesterday = yesterdayRecords.filter(r => r.statusId === 2).length

    const presentChange = presentToday - presentYesterday
    const absentChange = absentToday - absentYesterday

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