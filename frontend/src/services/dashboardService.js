import api from './api'

export default {
  getOrgAnalytics() {
    return api.get('/dashboard/org/analytics').then((res) => res.data.data)
  },
}
