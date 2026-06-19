/**
 * Pinia Store for SuperAdmin Dashboard
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useSuperAdminStore = defineStore('superAdminDash', () => {
  const organizations = ref([])
  const users = ref([])
  const systemOverview = ref({})
  const systemAnalytics = ref({})
  const auditLogs = ref([])
  const billingOverview = ref({})
  const loading = ref(false)
  const error = ref(null)

  const fetchOrganizations = async (page = 1, limit = 10, status = 'ACTIVE') => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/superadmin/organizations', {
        params: { page, limit, status }
      })
      organizations.value = response.data.data.data
      return response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchUsers = async (page = 1, limit = 10, status = 'ACTIVE') => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/superadmin/users', {
        params: { page, limit, status }
      })
      users.value = response.data.data.data
      return response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchSystemOverview = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/superadmin/dashboard/overview')
      systemOverview.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchSystemAnalytics = async (period = 30) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/superadmin/dashboard/analytics/organization-growth', {
        params: { days: period }
      })
      systemAnalytics.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAuditLogs = async (page = 1, limit = 20) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/superadmin/audit-logs', {
        params: { page, limit }
      })
      auditLogs.value = response.data.data || response.data.data?.data || []
      return response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchBillingOverview = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/superadmin/subscription-plans')
      billingOverview.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const suspendOrganization = async (orgId, reason) => {
    try {
      const response = await api.post(`/superadmin/organizations/${orgId}/suspend`, { reason })
      return response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const reactivateOrganization = async (orgId) => {
    try {
      const response = await api.post(`/superadmin/organizations/${orgId}/reactivate`)
      return response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const disableUser = async (userId, reason) => {
    try {
      const response = await api.post(`/superadmin/users/${userId}/disable`, { reason })
      return response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const enableUser = async (userId) => {
    try {
      const response = await api.post(`/superadmin/users/${userId}/enable`)
      return response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    // State
    organizations,
    users,
    systemOverview,
    systemAnalytics,
    auditLogs,
    billingOverview,
    loading,
    error,
    // Actions
    fetchOrganizations,
    fetchUsers,
    fetchSystemOverview,
    fetchSystemAnalytics,
    fetchAuditLogs,
    fetchBillingOverview,
    suspendOrganization,
    reactivateOrganization,
    disableUser,
    enableUser
  }
})
