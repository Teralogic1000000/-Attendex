import api from './api'

export default {
  getCurrentSubscription() {
    return api.get('/subscriptions/current').then((res) => res.data.data)
  },

  getPlans() {
    return api.get('/subscriptions/plans').then((res) => res.data.data)
  },

  upgradePlan(planId) {
    return api.post('/subscriptions/upgrade', { planId }).then((res) => res.data.data)
  },
}
