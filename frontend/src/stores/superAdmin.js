import { defineStore } from 'pinia'
import { ref } from 'vue'
import superAdminService from '@/services/superAdminService'
import { useNotificationStore } from './notification'
import { useLoadingStore } from './loading'

export const useSuperAdminStore = defineStore('superAdmin', () => {
  const systemStats = ref(null)
  const organizations = ref([])
  const allPlans = ref([])
  const logs = ref([])

  const notify = useNotificationStore()
  const loading = useLoadingStore()

  async function fetchStats() {
    loading.startLoading()
    try {
      const { data } = await superAdminService.getSystemStats()
      systemStats.value = data
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to fetch system stats')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function fetchOrganizations(params = {}) {
    loading.startLoading()
    try {
      const { data } = await superAdminService.getOrganizations(params)
      organizations.value = data.organizations || data
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to fetch organizations')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function updateOrgStatus(id, status) {
    loading.startLoading()
    try {
      await superAdminService.updateOrgStatus(id, status)
      notify.success('Organization status updated')
      await fetchOrganizations()
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to update organization')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function fetchLogs(params = {}) {
    loading.startLoading()
    try {
      const { data } = await superAdminService.getLogs(params)
      logs.value = data.logs || data
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to fetch logs')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function createPlan(planData) {
    loading.startLoading()
    try {
      const { data } = await superAdminService.createPlan(planData)
      notify.success('Plan created successfully')
      await fetchPlans()
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to create plan')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function fetchPlans() {
    loading.startLoading()
    try {
      const { data } = await superAdminService.getOrganizations()
      // Plans come from a separate endpoint - using subscriptions plans
      allPlans.value = data.plans || data
      return data
    } catch (err) {
      // Silently fail for plans fetch in super admin
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function updatePlan(id, planData) {
    loading.startLoading()
    try {
      const { data } = await superAdminService.updatePlan(id, planData)
      notify.success('Plan updated successfully')
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to update plan')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function deletePlan(id) {
    loading.startLoading()
    try {
      await superAdminService.deletePlan(id)
      notify.success('Plan deleted successfully')
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to delete plan')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  return {
    systemStats,
    organizations,
    allPlans,
    logs,
    fetchStats,
    fetchOrganizations,
    updateOrgStatus,
    fetchLogs,
    createPlan,
    fetchPlans,
    updatePlan,
    deletePlan,
  }
})
