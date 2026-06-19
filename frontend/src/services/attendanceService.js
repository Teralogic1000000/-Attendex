import api from './api'
import {
  getDeviceId,
  getCoreDeviceData,
  getAppVersion,
} from '@/utils/deviceUtils'
import {
  getCurrentLocation,
  isValidCoordinates,
} from '@/utils/geolocationUtils'

export default {
  /**
   * Check in with device and location validation
   * Sends: deviceId, deviceType, deviceModel, osVersion, appVersion, latitude, longitude
   */
  async checkIn() {
    try {
      // Get device information
      const deviceId = getDeviceId()
      const coreDeviceData = getCoreDeviceData()
      const appVersion = getAppVersion()

      // Get location (with user permission)
      let latitude, longitude
      try {
        const location = await getCurrentLocation()
        latitude = location.latitude
        longitude = location.longitude
      } catch (error) {
        console.warn('Could not get location:', error.message)
        // Location is optional, continue without it
      }

      // Prepare request body
      const checkInData = {
        deviceType: coreDeviceData.deviceType,
        deviceModel: coreDeviceData.deviceModel,
        osVersion: coreDeviceData.osVersion,
        appVersion,
      }

      // Add location if available
      if (latitude && longitude && isValidCoordinates(latitude, longitude)) {
        checkInData.latitude = latitude
        checkInData.longitude = longitude
      }

      // Send request with deviceId in headers
      const response = await api.post('/attendance/checkin', checkInData, {
        headers: {
          'x-device-id': deviceId,
        },
      })

      return response.data.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Check out with device and optional location validation
   * Sends: deviceId, deviceType, deviceModel, osVersion, appVersion, latitude (optional), longitude (optional)
   */
  async checkOut() {
    try {
      // Get device information
      const deviceId = getDeviceId()
      const coreDeviceData = getCoreDeviceData()
      const appVersion = getAppVersion()

      // Get location (optional for checkout)
      let latitude, longitude
      try {
        const location = await getCurrentLocation()
        latitude = location.latitude
        longitude = location.longitude
      } catch (error) {
        console.warn('Could not get location:', error.message)
        // Location is optional for checkout
      }

      // Prepare request body
      const checkOutData = {
        deviceType: coreDeviceData.deviceType,
        deviceModel: coreDeviceData.deviceModel,
        osVersion: coreDeviceData.osVersion,
        appVersion,
      }

      // Add location if available
      if (latitude && longitude && isValidCoordinates(latitude, longitude)) {
        checkOutData.latitude = latitude
        checkOutData.longitude = longitude
      }

      // Send request with deviceId in headers
      const response = await api.post('/attendance/checkout', checkOutData, {
        headers: {
          'x-device-id': deviceId,
        },
      })

      return response.data.data
    } catch (error) {
      throw error
    }
  },

  getMyAttendance(params = {}) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    );
    return api.get('/attendance/me', { params: cleanParams }).then((res) => res.data.data)
  },

  getOrgAttendance(params = {}) {
    // Only send non-empty parameters to backend
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    );
    return api.get('/attendance', { params: cleanParams }).then((res) => res.data.data)
  },

  // Get all attendance records
  getAttendance(params = {}) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    );
    return api.get('/attendance', { params: cleanParams }).then((res) => res.data.data || res.data)
  },

  // Get a specific attendance record
  getAttendanceRecord(id) {
    return api.get(`/attendance/${id}`).then((res) => res.data.data || res.data)
  },

  // Create new attendance record
  createAttendance(data) {
    return api.post('/attendance', data).then((res) => res.data.data || res.data)
  },

  // Update attendance record
  updateAttendance(id, data) {
    return api.put(`/attendance/${id}`, data).then((res) => res.data.data || res.data)
  },

  // Delete attendance record
  deleteAttendance(id) {
    return api.delete(`/attendance/${id}`).then((res) => res.data.data || res.data)
  },

  // Approve attendance record
  approveAttendance(id) {
    return api.post(`/attendance/${id}/approve`).then((res) => res.data.data || res.data)
  },

  // Reject attendance record
  rejectAttendance(id) {
    return api.post(`/attendance/${id}/reject`).then((res) => res.data.data || res.data)
  },
}

