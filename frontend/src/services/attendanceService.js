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
}
