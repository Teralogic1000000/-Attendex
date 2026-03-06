import api from './api'

export default {
  // Generate attendance report
  generateAttendanceReport(params = {}) {
    return api.get('/reports/attendance', { params }).then((res) => res.data.data || res.data)
  },

  // Generate department report
  generateDepartmentReport(departmentId, params = {}) {
    return api.get(`/reports/department/${departmentId}`, { params }).then((res) => res.data.data || res.data)
  },

  // Generate employee report
  generateEmployeeReport(userId, params = {}) {
    return api.get(`/reports/employee/${userId}`, { params }).then((res) => res.data.data || res.data)
  },

  // Get late arrivals report
  getLateArrivalsReport(params = {}) {
    return api.get('/reports/late-arrivals', { params }).then((res) => res.data.data || res.data)
  },

  // Get absences report
  getAbsencesReport(params = {}) {
    return api.get('/reports/absences', { params }).then((res) => res.data.data || res.data)
  },

  // Export report as CSV
  exportReportAsCSV(reportType, params = {}) {
    return api.get(`/reports/${reportType}/export`, { 
      params: { ...params, format: 'csv' },
      responseType: 'blob'
    })
  },

  // Export report as PDF
  exportReportAsPDF(reportType, params = {}) {
    return api.get(`/reports/${reportType}/export`, { 
      params: { ...params, format: 'pdf' },
      responseType: 'blob'
    })
  },

  // Get report statistics/summary
  getReportSummary(params = {}) {
    return api.get('/reports/summary', { params }).then((res) => res.data.data || res.data)
  },
}
