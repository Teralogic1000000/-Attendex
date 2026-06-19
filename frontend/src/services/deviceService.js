import api from './api'
import {
  getDeviceId,
  getCoreDeviceData,
  getAppVersion,
  setDeviceInfo,
  markDeviceTrusted,
} from '@/utils/deviceUtils'

export default {
  /**
   * Register current device with the backend
   * Called on first app launch or when user manually registers device
   */
  async registerDevice() {
    try {
      const deviceId = getDeviceId()
      const coreDeviceData = getCoreDeviceData()
      const appVersion = getAppVersion()

      const deviceData = {
        deviceId,
        deviceType: coreDeviceData.deviceType,
        deviceModel: coreDeviceData.deviceModel,
        osVersion: coreDeviceData.osVersion,
        appVersion,
      }

      const response = await api.post('/devices/register', deviceData)
      const registeredDevice = response.data.data

      // Cache device info locally
      setDeviceInfo(registeredDevice)

      // If first device (auto-trusted), mark as trusted
      if (registeredDevice.isTrusted) {
        markDeviceTrusted()
      }

      return registeredDevice
    } catch (error) {
      throw error
    }
  },

  /**
   * Get current device's registration details
   */
  async getMyDevice() {
    try {
      const deviceId = getDeviceId()
      const response = await api.get(`/devices/${deviceId}`)
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Get all devices registered for current user
   */
  async getMyDevices() {
    try {
      const response = await api.get('/devices/my-devices')
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Trust a device (after verification)
   */
  async trustDevice(deviceId) {
    try {
      const response = await api.put(`/devices/${deviceId}/trust`)
      const device = response.data.data

      // Update local cache
      if (device.deviceId === getDeviceId()) {
        setDeviceInfo(device)
        markDeviceTrusted()
      }

      return device
    } catch (error) {
      throw error
    }
  },

  /**
   * Revoke trust from a device
   */
  async untrustDevice(deviceId) {
    try {
      const response = await api.put(`/devices/${deviceId}/untrust`)
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Delete a registered device
   */
  async deleteDevice(deviceId) {
    try {
      const response = await api.delete(`/devices/${deviceId}`)
      return response.data.data
    } catch (error) {
      throw error
    }
  },
}
