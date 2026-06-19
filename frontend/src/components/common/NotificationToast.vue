<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 w-96">
    <transition-group name="toast">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="toastClass(notification.type)"
        class="flex items-start gap-3 rounded-lg p-4 shadow-lg ring-1 ring-inset"
        role="alert"
      >
        <component :is="toastIcon(notification.type)" class="h-5 w-5 shrink-0 mt-0.5" />
        <p class="text-sm font-medium flex-1">{{ notification.message }}</p>
        <button
          @click="notify.removeNotification(notification.id)"
          class="shrink-0 rounded-md p-0.5 hover:opacity-75 transition-opacity"
        >
          <X class="h-4 w-4" />
          <span class="sr-only">Close notification</span>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const notify = useNotificationStore()
const notifications = computed(() => notify.notifications)

function toastClass(type) {
  const classes = {
    success: 'bg-green-50 text-green-800 ring-green-200',
    error: 'bg-red-50 text-red-800 ring-red-200',
    warning: 'bg-yellow-50 text-yellow-800 ring-yellow-200',
    info: 'bg-blue-50 text-blue-800 ring-blue-200',
  }
  return classes[type] || classes.info
}

function toastIcon(type) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }
  return icons[type] || Info
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
