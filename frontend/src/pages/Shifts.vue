<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Shifts</h1>
      <p class="text-slate-600 mt-1">Manage work shifts and schedules</p>
    </div>

    <!-- Toolbar -->
    <div class="flex justify-between items-center mb-6 gap-4">
      <div class="flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search shifts..."
          class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
        />
      </div>
      
      <div class="flex gap-2">
        <button
          @click="fetchShifts"
          :disabled="loading"
          class="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium disabled:opacity-50"
          title="Refresh shifts"
        >
          {{ loading ? '⟳ Refreshing...' : '⟳ Refresh' }}
        </button>
        
        <button
          @click="openAddShiftModal"
          class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium whitespace-nowrap shadow-sm hover:shadow-md"
        >
          + Add Shift
        </button>
      </div>
    </div>

    <!-- Last Updated Info -->
    <div v-if="lastUpdated" class="mb-4 text-right text-xs text-gray-500">
      Last updated: {{ formatTime(lastUpdated) }}
    </div>

    <!-- Shifts Table -->
    <div class="bg-white rounded-xl shadow-sm border border-primary-100 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-600">
        Loading shifts...
      </div>
      <div v-else-if="filteredShifts.length === 0" class="p-8 text-center text-gray-600">
        No shifts found
      </div>
      <table v-else class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Start Time</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">End Time</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Employees</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Status</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="shift in filteredShifts" :key="shift.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-3 font-medium text-slate-900">{{ shift.name }}</td>
            <td class="px-6 py-3 text-slate-600">{{ shift.startTime }}</td>
            <td class="px-6 py-3 text-slate-600">{{ shift.endTime }}</td>
            <td class="px-6 py-3 text-slate-600 text-center">{{ shift.employeeCount || 0 }}</td>
            <td class="px-6 py-3 text-center">
              <span :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                shift.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
              ]">
                {{ shift.status }}
              </span>
            </td>
            <td class="px-6 py-3 text-center">
              <button
                @click="editShift(shift)"
                class="text-orange-600 hover:text-orange-700 font-medium text-sm mr-3 transition-colors"
              >
                Edit
              </button>
              <button
                @click="deleteShift(shift.id)"
                class="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Shift Modal -->
    <div v-if="showShiftModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div class="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 class="text-xl font-bold text-slate-900">
            {{ editingShift ? 'Edit Shift' : 'Add Shift' }}
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
            <label class="block text-sm font-medium text-slate-700 mb-1">Shift Name *</label>
            <input
              v-model="formData.name"
              type="text"
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Morning Shift"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Start Time *</label>
              <input
                v-model="formData.startTime"
                type="time"
                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">End Time *</label>
              <input
                v-model="formData.endTime"
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
            @click="saveShift"
            class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            {{ editingShift ? 'Update' : 'Add' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import shiftsService from '@/services/shiftsService'

const shifts = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showShiftModal = ref(false)
const editingShift = ref(null)
const lastUpdated = ref(null)
const refreshInterval = ref(null)
const REFRESH_INTERVAL = 10000

const formData = ref({
  name: '',
  startTime: '',
  endTime: '',
  status: 'Active'
})

const filteredShifts = computed(() => {
  return shifts.value.filter(shift => {
    const searchLower = searchQuery.value.toLowerCase()
    return shift.name.toLowerCase().includes(searchLower)
  })
})

const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

const fetchShifts = async () => {
  loading.value = true
  try {
    const data = await shiftsService.getShifts()
    shifts.value = Array.isArray(data) ? data : []
    lastUpdated.value = new Date()
  } catch (error) {
    console.error('Error fetching shifts:', error)
  } finally {
    loading.value = false
  }
}

const startAutoRefresh = () => {
  fetchShifts()
  refreshInterval.value = setInterval(() => {
    fetchShifts()
  }, REFRESH_INTERVAL)
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

const openAddShiftModal = () => {
  editingShift.value = null
  formData.value = { name: '', startTime: '', endTime: '', status: 'Active' }
  showShiftModal.value = true
}

const editShift = (shift) => {
  editingShift.value = shift
  formData.value = {
    name: shift.name,
    startTime: shift.startTime,
    endTime: shift.endTime,
    status: shift.status
  }
  showShiftModal.value = true
}

const saveShift = async () => {
  if (!formData.value.name.trim() || !formData.value.startTime || !formData.value.endTime) {
    alert('Please fill in all required fields')
    return
  }

  try {
    if (editingShift.value) {
      const updated = await shiftsService.updateShift(editingShift.value.id, formData.value)
      const index = shifts.value.findIndex(s => s.id === editingShift.value.id)
      if (index !== -1) {
        shifts.value[index] = updated
      }
    } else {
      const newShift = await shiftsService.createShift(formData.value)
      shifts.value.push(newShift)
      lastUpdated.value = new Date()
    }
    closeModal()
  } catch (error) {
    console.error('Error saving shift:', error)
    alert('Error saving shift')
  }
}

const deleteShift = async (id) => {
  if (confirm('Are you sure you want to delete this shift?')) {
    try {
      await shiftsService.deleteShift(id)
      shifts.value = shifts.value.filter(s => s.id !== id)
      lastUpdated.value = new Date()
    } catch (error) {
      console.error('Error deleting shift:', error)
      alert('Error deleting shift')
    }
  }
}

const closeModal = () => {
  showShiftModal.value = false
  editingShift.value = null
  formData.value = { name: '', startTime: '', endTime: '', status: 'Active' }
}

onMounted(() => {
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>
