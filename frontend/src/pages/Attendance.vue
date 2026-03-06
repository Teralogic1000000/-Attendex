<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Attendance</h1>
      <p class="text-slate-600 mt-1">Track and manage attendance records</p>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by employee name..."
        class="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
      />
      
      <input
        v-model="filterDate"
        type="date"
        class="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
      />

      <select
        v-model="filterStatus"
        class="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
      >
        <option value="">All Status</option>
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
        <option value="Late">Late</option>
        <option value="Leave">Leave</option>
      </select>

      <div class="flex gap-2">
        <button
          @click="fetchAttendance"
          :disabled="loading"
          class="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium disabled:opacity-50 flex-1"
          title="Refresh attendance"
        >
          {{ loading ? '⟳ Refreshing...' : '⟳ Refresh' }}
        </button>
        
        <button
          @click="openRecordAttendanceModal"
          class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium whitespace-nowrap shadow-sm hover:shadow-md"
        >
          + Record
        </button>
      </div>
    </div>

    <!-- Last Updated Info -->
    <div v-if="lastUpdated" class="mb-4 text-right text-xs text-slate-500">
      Last updated: {{ formatTime(lastUpdated) }}
    </div>

    <!-- Attendance Records Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-slate-500">
        Loading attendance records...
      </div>
      <div v-else-if="filteredAttendance.length === 0" class="p-8 text-center text-slate-500">
        No attendance records found
      </div>
      <table v-else class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Employee</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Check In</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Check Out</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Hours</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Status</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="record in filteredAttendance" :key="record.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-3 font-medium text-slate-900">{{ record.employeeName }}</td>
            <td class="px-6 py-3 text-slate-600">{{ record.date }}</td>
            <td class="px-6 py-3 text-slate-600">{{ record.checkIn || '-' }}</td>
            <td class="px-6 py-3 text-slate-600">{{ record.checkOut || '-' }}</td>
            <td class="px-6 py-3 text-slate-600 text-center">{{ record.totalHours || '-' }}</td>
            <td class="px-6 py-3 text-center">
              <span :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                record.status === 'Present' ? 'bg-green-100 text-green-700' :
                record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                record.status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              ]">
                {{ record.status }}
              </span>
            </td>
            <td class="px-6 py-3 text-center">
              <button
                v-if="record.status === 'Present'"
                @click="editAttendance(record)"
                class="text-orange-600 hover:text-orange-700 font-medium text-sm mr-2 transition-colors"
              >
                Edit
              </button>
              <button
                @click="deleteAttendance(record.id)"
                class="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Record Attendance Modal -->
    <div v-if="showAttendanceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div class="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 class="text-xl font-bold text-slate-900">
            {{ editingAttendance ? 'Edit Attendance' : 'Record Attendance' }}
          </h2>
          <button
            @click="closeModal"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Employee *</label>
            <input
              v-model="formData.employeeName"
              type="text"
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Employee name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Date *</label>
            <input
              v-model="formData.date"
              type="date"
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Check In</label>
              <input
                v-model="formData.checkIn"
                type="time"
                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Check Out</label>
              <input
                v-model="formData.checkOut"
                type="time"
                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              v-model="formData.status"
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Leave">Leave</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 p-6 border-t border-slate-200">
          <button
            @click="closeModal"
            class="px-4 py-2 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            @click="saveAttendance"
            class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            {{ editingAttendance ? 'Update' : 'Record' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import attendanceService from '@/services/attendanceService'

const attendanceRecords = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterDate = ref('')
const filterStatus = ref('')
const showAttendanceModal = ref(false)
const editingAttendance = ref(null)
const lastUpdated = ref(null)
const refreshInterval = ref(null)
const REFRESH_INTERVAL = 10000

const formData = ref({
  employeeName: '',
  date: '',
  checkIn: '',
  checkOut: '',
  status: 'Present'
})

const filteredAttendance = computed(() => {
  return attendanceRecords.value.filter(record => {
    const searchLower = searchQuery.value.toLowerCase()
    const matchesSearch = record.employeeName.toLowerCase().includes(searchLower)
    const matchesDate = !filterDate.value || record.date === filterDate.value
    const matchesStatus = !filterStatus.value || record.status === filterStatus.value
    
    return matchesSearch && matchesDate && matchesStatus
  })
})

const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

const fetchAttendance = async () => {
  loading.value = true
  try {
    const data = await attendanceService.getOrgAttendance()
    attendanceRecords.value = Array.isArray(data) ? data : []
    lastUpdated.value = new Date()
  } catch (error) {
    console.error('Error fetching attendance:', error)
  } finally {
    loading.value = false
  }
}

const startAutoRefresh = () => {
  fetchAttendance()
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

const openRecordAttendanceModal = () => {
  editingAttendance.value = null
  formData.value = {
    employeeName: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'Present'
  }
  showAttendanceModal.value = true
}

const editAttendance = (record) => {
  editingAttendance.value = record
  formData.value = {
    employeeName: record.employeeName,
    date: record.date,
    checkIn: record.checkIn,
    checkOut: record.checkOut,
    status: record.status
  }
  showAttendanceModal.value = true
}

const saveAttendance = async () => {
  if (!formData.value.employeeName.trim() || !formData.value.date) {
    alert('Please fill in required fields')
    return
  }

  try {
    if (editingAttendance.value) {
      const updated = await attendanceService.updateAttendance(editingAttendance.value.id, formData.value)
      const index = attendanceRecords.value.findIndex(a => a.id === editingAttendance.value.id)
      if (index !== -1) {
        attendanceRecords.value[index] = updated
      }
    } else {
      const newRecord = await attendanceService.createAttendance(formData.value)
      attendanceRecords.value.push(newRecord)
      lastUpdated.value = new Date()
    }
    closeModal()
  } catch (error) {
    console.error('Error saving attendance:', error)
    alert('Error saving attendance')
  }
}

const deleteAttendance = async (id) => {
  if (confirm('Are you sure you want to delete this record?')) {
    try {
      await attendanceService.deleteAttendance(id)
      attendanceRecords.value = attendanceRecords.value.filter(a => a.id !== id)
      lastUpdated.value = new Date()
    } catch (error) {
      console.error('Error deleting attendance:', error)
      alert('Error deleting attendance')
    }
  }
}

const closeModal = () => {
  showAttendanceModal.value = false
  editingAttendance.value = null
  formData.value = {
    employeeName: '',
    date: '',
    checkIn: '',
    checkOut: '',
    status: 'Present'
  }
}

onMounted(() => {
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>
