import api from './api'

export default {
  // Get all shifts for the organization
  getShifts(params = {}) {
    return api.get('/shifts', { params }).then((res) => res.data.data || res.data)
  },

  // Get a specific shift
  getShift(id) {
    return api.get(`/shifts/${id}`).then((res) => res.data.data || res.data)
  },

  // Create a new shift
  createShift(data) {
    return api.post('/shifts', data).then((res) => res.data.data || res.data)
  },

  // Update a shift
  updateShift(id, data) {
    return api.put(`/shifts/${id}`, data).then((res) => res.data.data || res.data)
  },

  // Delete a shift
  deleteShift(id) {
    return api.delete(`/shifts/${id}`).then((res) => res.data.data || res.data)
  },

  // Get employees assigned to a shift
  getShiftEmployees(shiftId, params = {}) {
    return api.get(`/shifts/${shiftId}/employees`, { params }).then((res) => res.data.data || res.data)
  },

  // Assign employee to shift
  assignEmployeeToShift(shiftId, userId) {
    return api.post(`/shifts/${shiftId}/employees/${userId}`).then((res) => res.data.data || res.data)
  },

  // Remove employee from shift
  removeEmployeeFromShift(shiftId, userId) {
    return api.delete(`/shifts/${shiftId}/employees/${userId}`).then((res) => res.data.data || res.data)
  },
}
