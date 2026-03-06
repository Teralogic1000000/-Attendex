import api from './api'

export default {
  // Get all departments for the organization
  getDepartments(params = {}) {
    return api.get('/departments', { params }).then((res) => res.data.data || res.data)
  },

  // Get a specific department
  getDepartment(id) {
    return api.get(`/departments/${id}`).then((res) => res.data.data || res.data)
  },

  // Create a new department
  createDepartment(data) {
    return api.post('/departments', data).then((res) => res.data.data || res.data)
  },

  // Update a department
  updateDepartment(id, data) {
    return api.put(`/departments/${id}`, data).then((res) => res.data.data || res.data)
  },

  // Delete a department
  deleteDepartment(id) {
    return api.delete(`/departments/${id}`).then((res) => res.data.data || res.data)
  },
}
