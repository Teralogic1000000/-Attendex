<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">Notification Center</h1>

    <!-- Notification Tabs -->
    <div class="flex gap-4 border-b border-gray-200">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="activeTab = tab"
        :class="[
          'px-6 py-3 font-medium border-b-2 transition-colors',
          activeTab === tab
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        ]"
      >
        {{ tab }}
        <span v-if="getTabCount(tab)" class="ml-2 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
          {{ getTabCount(tab) }}
        </span>
      </button>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3">
      <button
        @click="markAllAsRead"
        class="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Mark All as Read
      </button>
      <button
        @click="deleteAllNotifications"
        class="px-4 py-2 text-sm border border-danger-300 text-danger-600 rounded-lg hover:bg-danger-50 transition-colors"
      >
        Clear All
      </button>
    </div>

    <!-- Notifications List -->
    <div class="space-y-3">
      <div
        v-for="notif in filteredNotifications"
        :key="notif.id"
        :class="[
          'p-4 rounded-lg border transition-colors cursor-pointer',
          notif.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
        ]"
        @click="markAsRead(notif.id)"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">{{ notif.title }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ notif.message }}</p>
            <p class="text-xs text-gray-500 mt-2">{{ formatTime(notif.createdAt) }}</p>
          </div>
          <button
            @click.stop="deleteNotification(notif.id)"
            class="text-danger-600 hover:text-danger-900 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      <div v-if="filteredNotifications.length === 0" class="text-center py-12">
        <p class="text-gray-500">No notifications</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const activeTab = ref('All')
const tabs = ['All', 'Unread', 'Attendance', 'System', 'Approvals']

const notifications = ref([
  {
    id: 1,
    title: 'Attendance Alert',
    message: 'John Doe did not check in today',
    type: 'Attendance',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60000)
  },
  {
    id: 2,
    title: 'New Employee Added',
    message: 'Jane Smith has been added to the system',
    type: 'System',
    read: false,
    createdAt: new Date(Date.now() - 60 * 60000)
  },
  {
    id: 3,
    title: 'Leave Request',
    message: 'Bob Wilson has requested leave for 5 days',
    type: 'Approvals',
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60000)
  }
])

function formatTime(date) {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

const filteredNotifications = computed(() => {
  if (activeTab.value === 'All') return notifications.value
  if (activeTab.value === 'Unread') return notifications.value.filter(n => !n.read)
  return notifications.value.filter(n => n.type === activeTab.value)
})

function getTabCount(tab) {
  if (tab === 'All') return notifications.value.length
  if (tab === 'Unread') return notifications.value.filter(n => !n.read).length
  return notifications.value.filter(n => n.type === tab).length
}

function markAsRead(id) {
  const notif = notifications.value.find(n => n.id === id)
  if (notif) notif.read = true
}

function markAllAsRead() {
  notifications.value.forEach(n => (n.read = true))
}

function deleteNotification(id) {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

function deleteAllNotifications() {
  if (confirm('Clear all notifications?')) {
    notifications.value = []
  }
}
</script>
