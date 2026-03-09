import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import { ROLE_DASHBOARDS } from '@/utils/constants'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const accessToken = ref(localStorage.getItem('accessToken') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const fullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim()
  })
  const dashboardRoute = computed(() => {
    if (!userRole.value) return '/login'
    return ROLE_DASHBOARDS[userRole.value] || '/login'
  })

  async function login(credentials) {
    const data = await authService.login(credentials)
    accessToken.value = data.tokens.accessToken
    refreshToken.value = data.tokens.refreshToken
    user.value = data.user

    localStorage.setItem('accessToken', data.tokens.accessToken)
    localStorage.setItem('refreshToken', data.tokens.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))

    return data
  }

  async function register(formData) {
    const data = await authService.register(formData)
    return data
  }

  async function registerOrganization(formData) {
    const data = await authService.registerOrganization(formData)
    return data
  }

  async function registerSuperAdmin(formData) {
    const data = await authService.registerSuperAdmin(formData)
    return data
  }

  async function refreshAccessToken() {
    try {
      const data = await authService.refreshToken(refreshToken.value)
      accessToken.value = data.accessToken
      localStorage.setItem('accessToken', data.accessToken)

      if (data.refreshToken) {
        refreshToken.value = data.refreshToken
        localStorage.setItem('refreshToken', data.refreshToken)
      }
      return data.accessToken
    } catch {
      logout()
      throw new Error('Session expired')
    }
  }

  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  function checkAuth() {
    const storedToken = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      accessToken.value = storedToken
      user.value = JSON.parse(storedUser)
      refreshToken.value = localStorage.getItem('refreshToken')
      return true
    }
    return false
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    userRole,
    fullName,
    dashboardRoute,
    login,
    register,
    registerOrganization,
    registerSuperAdmin,
    refreshAccessToken,
    logout,
    checkAuth,
  }
})
