<template>
  <div id="app">
    <NotificationToast />
    <LoadingSpinner />
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import NotificationToast from '@/components/common/NotificationToast.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/hooks/useTheme'

const authStore = useAuthStore()

// Initialize theme when user is authenticated
onMounted(() => {
  useTheme()
})

// Apply theme when user data changes (e.g., after login)
watch(
  () => authStore.user?.organization?.theme,
  () => {
    // Theme composable watches this and applies automatically
  },
  { deep: true }
)
</script>
