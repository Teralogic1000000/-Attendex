/**
 * Geolocation utilities
 * Handles GPS coordinate retrieval and validation
 */

/**
 * Get current device location using Geolocation API
 * Returns Promise with { latitude, longitude, accuracy } or rejects with error
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    const options = {
      enableHighAccuracy: true,  // Request highest accuracy
      timeout: 10000,            // 10 second timeout
      maximumAge: 0,             // Don't use cached position
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        // Validate coordinates
        if (!isValidCoordinates(latitude, longitude)) {
          reject(new Error('Invalid coordinates received from device'))
          return
        }

        resolve({
          latitude: Math.round(latitude * 1000000) / 1000000,  // 6 decimal places (~0.1m accuracy)
          longitude: Math.round(longitude * 1000000) / 1000000,
          accuracy: Math.round(accuracy * 10) / 10,  // Accuracy in meters
        })
      },
      (error) => {
        reject(translateGeolocationError(error))
      },
      options
    )
  })
}

/**
 * Validate GPS coordinates
 * Latitude: -90 to 90
 * Longitude: -180 to 180
 */
export function isValidCoordinates(latitude, longitude) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  )
}

/**
 * Translate browser geolocation errors to user-friendly messages
 */
function translateGeolocationError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return new Error(
        'Location permission denied. Please enable location access in your browser settings and try again.'
      )
    case error.POSITION_UNAVAILABLE:
      return new Error(
        'Location information is unavailable. Please try again shortly.'
      )
    case error.TIMEOUT:
      return new Error(
        'Location request timed out. Please try again or check your location settings.'
      )
    default:
      return new Error('Failed to get your location. Please try again.')
  }
}

/**
 * Request location permission without getting coordinates
 * Useful for checking permission status upfront
 */
export async function requestLocationPermission() {
  if (!navigator.geolocation) {
    return false
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => resolve(true),  // Permission granted
      () => resolve(false)  // Permission denied
    )
  })
}

/**
 * Format location for display
 */
export function formatLocation(latitude, longitude, accuracy = null) {
  if (!latitude || !longitude) {
    return 'Unknown location'
  }

  let formatted = `${Math.abs(latitude).toFixed(4)}°${latitude >= 0 ? 'N' : 'S'}, ${Math.abs(longitude).toFixed(4)}°${longitude >= 0 ? 'E' : 'W'}`
  
  if (accuracy) {
    formatted += ` (±${Math.round(accuracy)}m)`
  }
  
  return formatted
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000 // Earth's radius in meters

  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(R * c)
}

/**
 * Format distance for display
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(2)}km`
}
