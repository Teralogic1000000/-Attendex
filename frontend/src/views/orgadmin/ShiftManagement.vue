<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Shift Management</h1>
        <p class="text-gray-600 mt-2">Manage work shifts and schedules</p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        + Add Shift
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="shift in shifts"
        :key="shift.id"
        class="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ shift.name }}</h3>
            <p class="text-sm text-gray-600">{{ shift.startTime }} - {{ shift.endTime }}</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="editShift(shift)"
              class="text-primary-600 hover:text-primary-900 text-sm font-medium"
            >
              Edit
            </button>
            <button
              @click="deleteShift(shift.id)"
              class="text-danger-600 hover:text-danger-900 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
        <div class="space-y-2 text-sm">
          <div>
            <span class="font-medium text-gray-900">Employees:</span>
            <span class="text-gray-600">{{ shift.employeeCount || 0 }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-900">Duration:</span>
            <span class="text-gray-600">{{ shift.duration }}h</span>
          </div>
          <div v-if="shift.breakTime" class="text-gray-600">
            <span class="font-medium">Break:</span> {{ shift.breakTime }}h
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-white">{{ editingShift ? 'Edit Shift' : 'Add New Shift' }}</h2>
          <button @click="closeModal" class="text-white hover:text-primary-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveShift" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Morning Shift"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              v-model="form.startTime"
              type="time"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              v-model="form.endTime"
              type="time"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Break Time (hours)</label>
            <input
              v-model="form.breakTime"
              type="number"
              step="0.5"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="1"
            />
          </div>

          <div v-if="error" class="p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-sm">
            {{ error }}
          </div>

          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" @click="closeModal" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button type="submit" :disabled="loading" class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 font-medium">
              {{ loading ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showAddModal = ref(false)
const loading = ref(false)
const error = ref('')
const editingShift = ref(null)
const shifts = ref([])

const form = ref({
  name: '',
  startTime: '',
  endTime: '',
  breakTime: 1
})

async function fetchShifts() {
  try {
    shifts.value = [
      { id: 1, name: 'Morning Shift', startTime: '06:00', endTime: '14:00', breakTime: 1, duration: 8, employeeCount: 15 },
      { id: 2, name: 'Evening Shift', startTime: '14:00', endTime: '22:00', breakTime: 1, duration: 8, employeeCount: 12 },
      { id: 3, name: 'Night Shift', startTime: '22:00', endTime: '06:00', breakTime: 1.5, duration: 8, employeeCount: 8 }
    ]
  } catch (err) {
    error.value = 'Failed to fetch shifts'
  }
}

function editShift(shift) {
  editingShift.value = shift
  form.value = { ...shift }
  showAddModal.value = true
}

async function saveShift() {
  loading.value = true
  error.value = ''
  try {
    if (editingShift.value) {
      const index = shifts.value.findIndex(s => s.id === editingShift.value.id)
      if (index >= 0) {
        shifts.value[index] = { ...editingShift.value, ...form.value }
      }
    } else {
      const hours = calculateDuration(form.value.startTime, form.value.endTime) - (form.value.breakTime || 0)
      shifts.value.push({
        id: Date.now(),
        ...form.value,
        duration: hours,
        employeeCount: 0
      })
    }
    closeModal()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function calculateDuration(start, end) {
  const [sHour, sMin] = start.split(':').map(Number)
  const [eHour, eMin] = end.split(':').map(Number)
  let hours = eHour - sHour
  if (eMin < sMin) hours--
  if (hours < 0) hours += 24
  return hours
}

async function deleteShift(id) {
  if (confirm('Are you sure?')) {
    shifts.value = shifts.value.filter(s => s.id !== id)
  }
}

function closeModal() {
  showAddModal.value = false
  editingShift.value = null
  form.value = { name: '', startTime: '', endTime: '', breakTime: 1 }
  error.value = ''
}

onMounted(fetchShifts)
</script>
