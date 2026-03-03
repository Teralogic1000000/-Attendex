import { defineStore } from 'pinia'
import { ref } from 'vue'
import subscriptionService from '@/services/subscriptionService'
import { useNotificationStore } from './notification'
import { useLoadingStore } from './loading'

export const useSubscriptionStore = defineStore('subscription', () => {
  const currentSubscription = ref(null)
  const plans = ref([])

  const notify = useNotificationStore()
  const loading = useLoadingStore()

  async function fetchCurrentSubscription() {
    loading.startLoading()
    try {
      const data = await subscriptionService.getCurrentSubscription()
      currentSubscription.value = data.subscription || data
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to fetch subscription')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function fetchPlans() {
    loading.startLoading()
    try {
      const data = await subscriptionService.getPlans()
      plans.value = data.plans || data
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to fetch plans')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function upgradePlan(planId) {
    loading.startLoading()
    try {
      const data = await subscriptionService.upgradePlan(planId)
      notify.success('Plan upgraded successfully')
      await fetchCurrentSubscription()
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to upgrade plan')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  return {
    currentSubscription,
    plans,
    fetchCurrentSubscription,
    fetchPlans,
    upgradePlan,
  }
})
