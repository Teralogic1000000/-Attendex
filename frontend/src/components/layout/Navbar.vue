<template>
  <nav class="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
    <div class="px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between gap-4">
        <!-- Left: Menu Toggle & Search -->
        <div class="flex items-center gap-4 flex-1">
          <button
            @click="$emit('toggle-sidebar')"
            class="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Search Bar -->
          <div class="relative hidden md:block flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search users, departments..."
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
            />
            <svg class="absolute right-3 top-2.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-3 sm:gap-4">
          <!-- Notifications -->
          <div class="relative">
            <button
              class="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
            >
              <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>

          <!-- Admin Profile Dropdown -->
          <div class="relative group">
            <button
              class="flex items-center gap-2 p-2 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {{ userInitials }}
              </div>
              <span class="hidden sm:inline text-sm font-medium text-gray-700">{{ userName }}</span>
              <svg class="w-4 h-4 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-primary-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div class="p-4 border-b border-primary-100">
                <p class="text-sm font-medium text-dark-900">John Doe</p>
                <p class="text-xs text-gray-600">Admin Account</p>
              </div>
              <a
                href="#"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
              >
                Profile Settings
              </a>
              <a
                href="#"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
              >
                Preferences
              </a>
              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors border-t border-primary-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => {
  if (!authStore.user) return 'Admin'
  return `${authStore.user.firstName || ''} ${authStore.user.lastName || ''}`.trim() || 'Admin'
})

const userInitials = computed(() => {
  if (!authStore.user) return 'A'
  const first = authStore.user.firstName?.[0]?.toUpperCase() || 'A'
  const last = authStore.user.lastName?.[0]?.toUpperCase() || 'A'
  return (first + last).slice(0, 2)
})

const handleLogout = async () => {
  authStore.logout()
  router.push('/login')
}

defineEmits<{
  'toggle-sidebar': []
}>()
</script>
