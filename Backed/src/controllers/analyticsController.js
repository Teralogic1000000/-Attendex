import { findMany } from '../config/supabaseMapper.js'
import { successResponse } from '../utils/response.js'

export const orgAnalytics = async (req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 6) // last 7 days

  // Fetch all attendance records for the date range
  const attendances = await findMany('attendance', { orgId: req.user.orgId }, { limit: 100000 })
  
  // Filter by date range
  const filteredRecords = attendances.filter(record => {
    const recordDate = new Date(record.checkInTime || record.createdAt)
    recordDate.setHours(0, 0, 0, 0)
    return recordDate >= startDate && recordDate <= today
  })

  // Group by date on client side
  const map = {}
  filteredRecords.forEach(record => {
    const recordDate = new Date(record.checkInTime || record.createdAt)
    recordDate.setHours(0, 0, 0, 0)
    const key = recordDate.toISOString().slice(0, 10)
    
    if (!map[key]) {
      map[key] = {
        count: 0,
        totalHours: 0,
        recordCount: 0
      }
    }
    
    map[key].count += 1
    map[key].totalHours += record.totalHours || 0
    map[key].recordCount += 1
  })

  // Generate data for each day of the 7-day period
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    d.setHours(0, 0, 0, 0)
    const key = d.toISOString().slice(0, 10)
    
    const dayData = map[key] || { count: 0, totalHours: 0, recordCount: 0 }
    const avgHours = dayData.recordCount > 0 
      ? Number((dayData.totalHours / dayData.recordCount).toFixed(2))
      : 0
    
    days.push({
      date: key,
      attendanceCount: dayData.count,
      avgHours: avgHours
    })
  }

  // Calculate average hours for the 7-day period
  const totalHours = filteredRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0)
  const avgHoursLast7 = filteredRecords.length > 0 
    ? Number((totalHours / filteredRecords.length).toFixed(2))
    : 0

  return successResponse(res, 'Analytics fetched', {
    weekly: days,
    avgHoursLast7: avgHoursLast7
  })
}
