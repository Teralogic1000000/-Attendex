<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-slate-900">Recent Attendance</h3>
        <p class="text-sm text-slate-600">Today's check-ins</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="fetchAttendance"
          :disabled="loading"
          class="text-sm px-3 py-1 bg-orange-50 text-orange-600 rounded hover:bg-orange-400 transition-colors disabled:opacity-50 font-medium"
          title="Refresh attendance"
        >
          {{ loading ? '⟳' : '⟳ Refresh' }}
        </button>
        <router-link to="/admin/attendance" class="text-sm text-orange-600 hover:text-orange-700 font-medium">View All</router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && attendanceData.length === 0" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
      <p class="text-orange-600 text-sm mt-2">Loading attendance...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8 text-red-600 text-sm">
      <p>Failed to load attendance data</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="attendanceData.length === 0" class="text-center py-8 text-slate-600">
      <p class="text-sm">No attendance records today</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700">Name</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700">Department</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700">Check In</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in attendanceData" :key="record.id" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full"></div>
                <span class="text-sm font-medium text-slate-900">{{ record.name || 'Unknown' }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-slate-900">{{ record.department || '-' }}</td>
            <td class="px-4 py-3 text-sm text-slate-900">{{ formatTime(record.checkIn) || '-' }}</td>
            <td class="px-4 py-3">
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                record.status === 'Present' ? 'bg-green-100 text-green-800' :
                record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                'bg-slate-100 text-slate-800'
              ]">
                {{ record.status || 'Unknown' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Last Updated -->
      <div v-if="lastUpdated" class="text-right mt-4 text-xs text-slate-500">
        Updated: {{ formatUpdatedTime(lastUpdated) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import attendanceService from '@/services/attendanceService'

const attendanceData = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const lastUpdated = ref<Date | null>(null)
const refreshInterval = ref<ReturnType<typeof setInterval> | null>(null)
const REFRESH_INTERVAL = 15000 // 15 seconds

const formatTime = (dateString: string | Date) => {
  if (!dateString) return '-'
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  } catch {
    return '-'
  }
}

const formatUpdatedTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

const fetchAttendance = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await attendanceService.getOrgAttendance()
    
    // Filter for today's records and format data
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (Array.isArray(data)) {
      attendanceData.value = data
        .filter(record => {
          const recordDate = new Date(record.date)
          recordDate.setHours(0, 0, 0, 0)
          return recordDate.getTime() === today.getTime()
        })
        .slice(0, 5) // Show only first 5 records
        .map(record => ({
          ...record,
          name: record.user ? `${record.user.firstName} ${record.user.lastName}` : 'Unknown'
        }))
    } else {
      attendanceData.value = []
    }
    
    lastUpdated.value = new Date()
  } catch (err) {
    console.error('Error fetching attendance:', err)
    error.value = 'Failed to load attendance data'
    attendanceData.value = []
  } finally {
    loading.value = false
  }
}

const startAutoRefresh = () => {
  // Initial fetch
  fetchAttendance()
  
  // Set up auto-refresh
  refreshInterval.value = setInterval(() => {
    fetchAttendance()
  }, REFRESH_INTERVAL)
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

onMounted(() => {
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>
