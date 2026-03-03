import { defineStore } from 'pinia'
import { ref } from 'vue'
import userService from '@/services/userService'
import { useNotificationStore } from './notification'
import { useLoadingStore } from './loading'

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const userStats = ref(null)

  const notify = useNotificationStore()
  const loading = useLoadingStore()

  async function fetchUsers(params = {}) {
    loading.startLoading()
    try {
      const data = await userService.getUsers(params)
      users.value = data.users || data
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to fetch users')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function createUser(userData) {
    loading.startLoading()
    try {
      const data = await userService.createUser(userData)
      notify.success('User created successfully')
      await fetchUsers()
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to create user')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function updateUser(id, userData) {
    loading.startLoading()
    try {
      const data = await userService.updateUser(id, userData)
      notify.success('User updated successfully')
      await fetchUsers()
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to update user')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function deleteUser(id) {
    loading.startLoading()
    try {
      await userService.deleteUser(id)
      notify.success('User deleted successfully')
      await fetchUsers()
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to delete user')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function fetchStats() {
    loading.startLoading()
    try {
      const data = await userService.getUserStats()
      userStats.value = data
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to fetch user stats')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  return {
    users,
    userStats,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    fetchStats,
  }
})
