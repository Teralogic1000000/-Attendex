import { computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * Composable for managing organization theme colors
 * Applies theme colors as CSS custom properties to document root
 */
export function useTheme() {
  const authStore = useAuthStore()

  // Get organization's theme settings
  const orgTheme = computed(() => {
    const org = authStore.user?.organization || {}
    return org.theme || {
      primary: '#ff6600',
      secondary: '#000000',
      darkMode: false,
    }
  })

  // Get organization logo URL
  const orgLogo = computed(() => authStore.user?.organization?.logoUrl || '')

  /**
   * Apply theme colors to document root as CSS variables
   * This allows Tailwind and custom CSS to access org colors
   */
  function applyTheme(theme) {
    const root = document.documentElement

    // Set primary color and its shades
    const primaryColor = theme?.primary || '#ff6600'
    root.style.setProperty('--org-primary', primaryColor)
    root.style.setProperty('--org-primary-light', lightenColor(primaryColor, 20))
    root.style.setProperty('--org-primary-dark', darkenColor(primaryColor, 20))

    // Set secondary color
    const secondaryColor = theme?.secondary || '#000000'
    root.style.setProperty('--org-secondary', secondaryColor)

    // Apply dark mode class if enabled
    if (theme?.darkMode) {
      root.classList.add('org-dark-mode')
    } else {
      root.classList.remove('org-dark-mode')
    }
  }

  /**
   * Convert hex color to RGB for use with opacity modifiers
   */
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return '255, 102, 0' // Default orange fallback
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
  }

  /**
   * Lighten a hex color by a percentage
   */
  function lightenColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16)
    const r = Math.min(255, Math.floor((num >> 16) * (1 + percent / 100)))
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00ff) * (1 + percent / 100)))
    const b = Math.min(255, Math.floor((num & 0x0000ff) * (1 + percent / 100)))
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Darken a hex color by a percentage
   */
  function darkenColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16)
    const r = Math.max(0, Math.floor((num >> 16) * (1 - percent / 100)))
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00ff) * (1 - percent / 100)))
    const b = Math.max(0, Math.floor((num & 0x0000ff) * (1 - percent / 100)))
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Get a role-specific dashboard color
   * Different dashboard colors for SuperAdmin, OrgAdmin, Employee
   */
  function getDashboardColor(userRole) {
    const colorMap = {
      'super-admin': { primary: '#9333ea', secondary: '#fbbf24' }, // Purple + Gold
      'org-admin': { primary: '#0ea5e9', secondary: '#64748b' }, // Sky + Slate
      'employee': { primary: '#10b981', secondary: '#94a3b8' }, // Emerald + Slate
    }
    return colorMap[userRole] || colorMap['employee']
  }

  /**
   * Apply role-specific dashboard theme
   */
  function applyDashboardTheme(userRole) {
    const dashboardColor = getDashboardColor(userRole)
    const root = document.documentElement

    root.style.setProperty('--dashboard-primary', dashboardColor.primary)
    root.style.setProperty('--dashboard-secondary', dashboardColor.secondary)
    root.style.setProperty('--dashboard-primary-dark', darkenColor(dashboardColor.primary, 15))
  }

  // Watch for theme changes and apply them
  watch(
    () => orgTheme.value,
    (newTheme) => {
      applyTheme(newTheme)
    },
    { immediate: true, deep: true }
  )

  // Watch for user role changes and apply dashboard theme
  watch(
    () => authStore.userRole,
    (newRole) => {
      if (newRole) {
        applyDashboardTheme(newRole)
      }
    },
    { immediate: true }
  )

  // Apply on mount
  onMounted(() => {
    applyTheme(orgTheme.value)
    applyDashboardTheme(authStore.userRole)
  })

  return {
    orgTheme,
    orgLogo,
    applyTheme,
    applyDashboardTheme,
    lightenColor,
    darkenColor,
    hexToRgb,
    getDashboardColor,
  }
}
