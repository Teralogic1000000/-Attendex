/**
 * Format a date string to a readable format
 */
export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

/**
 * Format a date string to time only
 */
export function formatTime(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format a date to full datetime
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calculate hours between two dates
 */
export function calculateHours(start, end) {
  if (!start || !end) return '-'
  const diff = new Date(end) - new Date(start)
  const hours = diff / (1000 * 60 * 60)
  return hours.toFixed(1)
}

/**
 * Get initials from a name
 */
export function getInitials(firstName, lastName) {
  const f = firstName ? firstName.charAt(0).toUpperCase() : ''
  const l = lastName ? lastName.charAt(0).toUpperCase() : ''
  return `${f}${l}`
}

/**
 * Format currency amount
 */
export function formatCurrency(amount, currency = 'USD') {
  if (amount == null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Get a greeting based on time of day
 */
export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/**
 * Format a number for display (e.g., 1234 -> 1,234)
 */
export function formatNumber(num) {
  if (num == null) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function timeAgo(dateStr) {
  if (!dateStr) return '-'
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now - date) / 1000)

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`
    }
  }
  return 'Just now'
}
