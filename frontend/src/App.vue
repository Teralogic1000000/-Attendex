<template>
  <div id="app">
    <NotificationToast />
    <LoadingSpinner />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="$route.fullPath" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import NotificationToast from '@/components/common/NotificationToast.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/hooks/useTheme'

const authStore = useAuthStore()
const router = useRouter()

// Initialize theme when user is authenticated
onMounted(() => {
  authStore.checkAuth()
  useTheme()
})

// Scroll to top on route change
router.afterEach(() => {
  window.scrollTo(0, 0)
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
