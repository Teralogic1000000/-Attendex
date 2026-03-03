import api from './api'

export default {
  getSystemStats() {
    return api.get('/superadmin/stats')
  },

  getOrganizations(params = {}) {
    return api.get('/superadmin/organizations', { params })
  },

  getOrganizationDetails(id) {
    return api.get(`/superadmin/organizations/${id}`)
  },

  updateOrgStatus(id, status) {
    return api.put(`/superadmin/organizations/${id}/status`, { status })
  },

  createPlan(data) {
    return api.post('/superadmin/plans', data)
  },

  updatePlan(id, data) {
    return api.put(`/superadmin/plans/${id}`, data)
  },

  deletePlan(id) {
    return api.delete(`/superadmin/plans/${id}`)
  },

  getLogs(params = {}) {
    return api.get('/superadmin/logs', { params })
  },
}
