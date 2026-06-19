import api from './api'

export default {
  getUsers(params = {}) {
    return api.get('/users', { params }).then((res) => res.data.data)
  },

  getUser(id) {
    return api.get(`/users/${id}`).then((res) => res.data.data)
  },

  createUser(data) {
    return api.post('/users', data).then((res) => res.data.data)
  },

  updateUser(id, data) {
    return api.put(`/users/${id}`, data).then((res) => res.data.data)
  },

  deleteUser(id) {
    return api.delete(`/users/${id}`).then((res) => res.data.data)
  },

  getUserStats() {
    return api.get('/users/stats/overview').then((res) => res.data.data)
  },

  changePassword(id, data) {
    return api.put(`/users/${id}/password`, data).then((res) => res.data.data)
  },
}
