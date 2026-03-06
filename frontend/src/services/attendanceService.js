import api from './api'

export default {
  checkIn() {
    return api.post('/attendance/checkin').then((res) => res.data.data)
  },

  checkOut() {
    return api.post('/attendance/checkout').then((res) => res.data.data)
  },

  getMyAttendance(params = {}) {
    return api.get('/attendance/me', { params }).then((res) => res.data.data)
  },

  getOrgAttendance(params = {}) {
    return api.get('/attendance', { params }).then((res) => res.data.data)
  },

  // Get all attendance records
  getAttendance(params = {}) {
    return api.get('/attendance', { params }).then((res) => res.data.data || res.data)
  },

  // Get a specific attendance record
  getAttendanceRecord(id) {
    return api.get(`/attendance/${id}`).then((res) => res.data.data || res.data)
  },

  // Create new attendance record
  createAttendance(data) {
    return api.post('/attendance', data).then((res) => res.data.data || res.data)
  },

  // Update attendance record
  updateAttendance(id, data) {
    return api.put(`/attendance/${id}`, data).then((res) => res.data.data || res.data)
  },

  // Delete attendance record
  deleteAttendance(id) {
    return api.delete(`/attendance/${id}`).then((res) => res.data.data || res.data)
  },

  // Approve attendance record
  approveAttendance(id) {
    return api.post(`/attendance/${id}/approve`).then((res) => res.data.data || res.data)
  },

  // Reject attendance record
  rejectAttendance(id) {
    return api.post(`/attendance/${id}/reject`).then((res) => res.data.data || res.data)
  },
}

