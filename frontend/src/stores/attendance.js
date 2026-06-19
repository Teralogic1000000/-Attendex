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
  const lastValidationError = ref(null)  // Store validation error details

  const notify = useNotificationStore()
  const loading = useLoadingStore()

  /**
   * Check in with device and location validation
   * Handles various validation errors (device, geofence, shift)
   */
  async function checkIn() {
    loading.startLoading()
    try {
      const data = await attendanceService.checkIn()
      currentStatus.value = 'checked_in'
      todayRecord.value = data.record || data
      lastValidationError.value = null  // Clear any previous errors
      notify.success('Checked in successfully')
      return data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Check-in failed'
      const details = err.response?.data?.details || {}
      
      // Store detailed error info for component use
      lastValidationError.value = {
        message: errorMessage,
        details,
        status: err.response?.status,
      }

      // Provide helpful error messages based on status
      if (err.response?.status === 403) {
        if (details.error === 'DEVICE_VALIDATION_FAILED') {
          notify.error('Your device is not trusted. Please register or verify your device first.')
        } else if (details.error === 'GEOFENCE_VALIDATION_FAILED') {
          notify.error(
            `You are outside the allowed location zone. Please move to the designated location and try again.`
          )
        } else {
          notify.error(errorMessage)
        }
      } else if (err.response?.status === 400) {
        if (details.error === 'DUPLICATE_CHECKIN') {
          notify.error('You have already checked in today. Please check out first.')
        } else if (details.error === 'INVALID_COORDINATES') {
          notify.error('Invalid location data. Please ensure location is enabled.')
        } else {
          notify.error(errorMessage)
        }
      } else if (err.message?.includes('location')) {
        notify.error('Could not access your location. Please check your device settings.')
      } else {
        notify.error(errorMessage)
      }

      throw err
    } finally {
      loading.stopLoading()
    }
  }

  /**
   * Check out with optional device and location validation
   */
  async function checkOut() {
    loading.startLoading()
    try {
      const data = await attendanceService.checkOut()
      currentStatus.value = 'checked_out'
      todayRecord.value = data.record || data
      lastValidationError.value = null  // Clear any previous errors
      notify.success('Checked out successfully')
      return data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Check-out failed'
      const details = err.response?.data?.details || {}

      // Store detailed error info for component use
      lastValidationError.value = {
        message: errorMessage,
        details,
        status: err.response?.status,
      }

      // Provide helpful error messages
      if (err.response?.status === 403) {
        if (details.error === 'DEVICE_VALIDATION_FAILED') {
          notify.error('Your device is not trusted. Cannot complete check-out.')
        } else if (details.error === 'GEOFENCE_VALIDATION_FAILED') {
          notify.error('You are outside the allowed location zone for check-out.')
        } else {
          notify.error(errorMessage)
        }
      } else if (err.response?.status === 404) {
        notify.error('No check-in record found for today.')
      } else if (err.message?.includes('location')) {
        notify.error('Could not access your location.')
      } else {
        notify.error(errorMessage)
      }

      throw err
    } finally {
      loading.stopLoading()
    }
  }

  /**
   * Clear validation error
   */
  function clearValidationError() {
    lastValidationError.value = null
  }

  /**
   * Get validation error details (for UI display)
   */
  function getValidationErrorDetails() {
    return lastValidationError.value
  }

  async function fetchMyAttendance(params = {}) {
    loading.startLoading()
    try {
      const data = await attendanceService.getMyAttendance(params)
      myAttendance.value = data.attendance || data.records || data
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
      orgAttendance.value = data.attendance || data.records || data
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
    lastValidationError,
    checkIn,
    checkOut,
    fetchMyAttendance,
    fetchOrgAttendance,
    clearValidationError,
    getValidationErrorDetails,
  }
})
