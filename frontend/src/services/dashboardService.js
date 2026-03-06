import api from './api'

export default {
  getOrgAnalytics() {
    return api.get('/dashboard/org').then((res) => res.data.data)
  },
}
