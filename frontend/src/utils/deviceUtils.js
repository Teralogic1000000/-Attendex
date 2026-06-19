/**
 * Device information utilities
 * Handles device registration, retrieval, and geolocation
 */

/**
 * Get or create device ID
 * Stores in localStorage for persistence across sessions
 */
export function getDeviceId() {
  let deviceId = localStorage.getItem('deviceId')
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('deviceId', deviceId)
  }
  return deviceId
}

/**
 * Get device information from localStorage
 * Returns cached device info if available
 */
export function getDeviceInfo() {
  const cached = localStorage.getItem('deviceInfo')
  if (cached) {
    try {
      return JSON.parse(cached)
    } catch (e) {
      console.error('Failed to parse cached device info:', e)
    }
  }
  return null
}

/**
 * Store device information in localStorage
 * Called after successful device registration
 */
export function setDeviceInfo(deviceInfo) {
  localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo))
}

/**
 * Get basic device information from browser
 * Used during device registration and check-in
 */
export function getCoreDeviceData() {
  const userAgent = navigator.userAgent
  
  // Detect device type and model
  let deviceType = 'Web'
  let deviceModel = 'Unknown'
  
  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    deviceType = 'iOS'
    if (/iPad/.test(userAgent)) {
      deviceModel = 'iPad'
    } else if (/iPhone/.test(userAgent)) {
      deviceModel = 'iPhone'
    }
  }
  // Android detection
  else if (/Android/.test(userAgent)) {
    deviceType = 'Android'
    deviceModel = /Android.*; ([^)]+)/.exec(userAgent)?.[1] || 'Android Device'
  }
  
  // Get OS version
  const osVersion = getOSVersion(userAgent)
  
  return {
    deviceType,
    deviceModel,
    osVersion,
  }
}

/**
 * Extract OS version from user agent
 */
function getOSVersion(userAgent) {
  // iOS
  const iosMatch = userAgent.match(/OS (\d+_\d+(_\d+)?)/)
  if (iosMatch) {
    return iosMatch[1].replace(/_/g, '.')
  }
  
  // Android
  const androidMatch = userAgent.match(/Android (\d+\.\d+(\.\d+)?)/)
  if (androidMatch) {
    return androidMatch[1]
  }
  
  // Windows
  const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/)
  if (windowsMatch) {
    return `Windows ${windowsMatch[1]}`
  }
  
  // macOS
  const macMatch = userAgent.match(/Mac OS X (\d+[._]\d+([._]\d+)?)/)
  if (macMatch) {
    return macMatch[1].replace(/_/g, '.')
  }
  
  return 'Unknown'
}

/**
 * Get application version
 * Can be updated from environment or package.json
 */
export function getAppVersion() {
  // Can be set from import.meta.env.VITE_APP_VERSION or hardcoded
  return import.meta.env.VITE_APP_VERSION || '1.0.0'
}

/**
 * Clear stored device info and ID
 * Called during logout
 */
export function clearDeviceInfo() {
  localStorage.removeItem('deviceId')
  localStorage.removeItem('deviceInfo')
  localStorage.removeItem('isTrusted')
}

/**
 * Mark device as trusted in localStorage
 */
export function markDeviceTrusted() {
  localStorage.setItem('isTrusted', 'true')
}

/**
 * Check if device is marked as trusted
 */
export function isDeviceTrusted() {
  return localStorage.getItem('isTrusted') === 'true'
}

/**
 * Get current device status
 */
export function getCurrentDeviceStatus() {
  return {
    deviceId: getDeviceId(),
    isTrusted: isDeviceTrusted(),
    info: getDeviceInfo(),
  }
}
