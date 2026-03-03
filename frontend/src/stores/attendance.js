import { defineStore } from 'pinia'
import { ref } from 'vue'
import attendanceService from '@/services/attendanceService'
import { useNotificationStore } from './notification'
import { useLoadingStore } from './loading'

export const useAttendanceStore = defineStore('attendance', () => {
  const myAttendance = ref([])
  const orgAttendance = ref([])
  const currentStatus = ref(null)
  const todayRecord = ref(null)

  const notify = useNotificationStore()
  const loading = useLoadingStore()

  async function checkIn() {
    loading.startLoading()
    try {
      const data = await attendanceService.checkIn()
      currentStatus.value = 'checked_in'
      todayRecord.value = data.record || data
      notify.success('Checked in successfully')
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Check-in failed')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function checkOut() {
    loading.startLoading()
    try {
      const data = await attendanceService.checkOut()
      currentStatus.value = 'checked_out'
      todayRecord.value = data.record || data
      notify.success('Checked out successfully')
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Check-out failed')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function fetchMyAttendance(params = {}) {
    loading.startLoading()
    try {
      const data = await attendanceService.getMyAttendance(params)
      myAttendance.value = data.records || data
      if (data.todayRecord) {
        todayRecord.value = data.todayRecord
        currentStatus.value = data.todayRecord.checkOut ? 'checked_out' : 'checked_in'
      }
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to fetch attendance')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  async function fetchOrgAttendance(params = {}) {
    loading.startLoading()
    try {
      const data = await attendanceService.getOrgAttendance(params)
      orgAttendance.value = data.records || data
      return data
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to fetch org attendance')
      throw err
    } finally {
      loading.stopLoading()
    }
  }

  return {
    myAttendance,
    orgAttendance,
    currentStatus,
    todayRecord,
    checkIn,
    checkOut,
    fetchMyAttendance,
    fetchOrgAttendance,
  }
})
