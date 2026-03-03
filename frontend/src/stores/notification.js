import { defineStore } from 'pinia'
import { ref } from 'vue'

let nextId = 0

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])

  function addNotification(type, message, duration = 5000) {
    const id = nextId++
    notifications.value.push({ id, type, message })

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  function removeNotification(id) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  function success(message) {
    return addNotification('success', message)
  }

  function error(message) {
    return addNotification('error', message)
  }

  function warning(message) {
    return addNotification('warning', message)
  }

  function info(message) {
    return addNotification('info', message)
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  }
})
