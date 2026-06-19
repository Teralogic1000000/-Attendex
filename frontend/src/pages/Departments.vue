<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Departments</h1>
      <p class="text-slate-600 mt-1">Manage your organization departments</p>
    </div>

    <!-- Toolbar -->
    <div class="flex justify-between items-center mb-6 gap-4">
      <div class="flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search departments..."
          class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
        />
      </div>
      
      <div class="flex gap-2">
        <button
          @click="fetchDepartments"
          :disabled="loading"
          class="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium disabled:opacity-50"
          title="Refresh departments"
        >
          {{ loading ? '⟳ Refreshing...' : '⟳ Refresh' }}
        </button>
        
        <button
          @click="openAddDepartmentModal"
          class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium whitespace-nowrap shadow-sm hover:shadow-md"
        >
          + Add Department
        </button>
      </div>
    </div>

    <!-- Last Updated Info -->
    <div v-if="lastUpdated" class="mb-4 text-right text-xs text-gray-500">
      Last updated: {{ formatTime(lastUpdated) }}
    </div>

    <!-- Departments Table -->
    <div class="bg-white rounded-xl shadow-sm border border-primary-100 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-600">
        Loading departments...
      </div>
      <div v-else-if="filteredDepartments.length === 0" class="p-8 text-center text-gray-600">
        No departments found
      </div>
      <table v-else class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Description</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Head</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Employees</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="dept in filteredDepartments" :key="dept.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-3 font-medium text-slate-900">{{ dept.name }}</td>
            <td class="px-6 py-3 text-slate-600 text-sm">{{ dept.description || '-' }}</td>
            <td class="px-6 py-3 text-slate-600 text-sm">{{ dept.head || '-' }}</td>
            <td class="px-6 py-3 text-slate-600 text-center">{{ dept.employeeCount || 0 }}</td>
            <td class="px-6 py-3 text-center">
              <button
                @click="editDepartment(dept)"
                class="text-orange-600 hover:text-orange-700 font-medium text-sm mr-3 transition-colors"
              >
                Edit
              </button>
              <button
                @click="deleteDepartment(dept.id)"
                class="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Department Modal -->
    <div v-if="showDepartmentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div class="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 class="text-xl font-bold text-slate-900">
            {{ editingDepartment ? 'Edit Department' : 'Add Department' }}
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
            <label class="block text-sm font-medium text-slate-700 mb-1">Department Name *</label>
            <input
              v-model="formData.name"
              type="text"
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Engineering"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              v-model="formData.description"
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows="3"
              placeholder="Department description"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Department Head</label>
            <input
              v-model="formData.head"
              type="text"
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., John Smith"
            />
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
            @click="saveDepartment"
            class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            {{ editingDepartment ? 'Update' : 'Add' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import departmentsService from '@/services/departmentsService'

const departments = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showDepartmentModal = ref(false)
const editingDepartment = ref(null)
const lastUpdated = ref(null)
const refreshInterval = ref(null)
const REFRESH_INTERVAL = 10000 // 10 seconds

const formData = ref({
  name: '',
  description: '',
  head: ''
})

const filteredDepartments = computed(() => {
  return departments.value.filter(dept => {
    const searchLower = searchQuery.value.toLowerCase()
    return (
      dept.name.toLowerCase().includes(searchLower) ||
      (dept.description && dept.description.toLowerCase().includes(searchLower)) ||
      (dept.head && dept.head.toLowerCase().includes(searchLower))
    )
  })
})

const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

const fetchDepartments = async () => {
  loading.value = true
  try {
    const data = await departmentsService.getDepartments()
    departments.value = Array.isArray(data) ? data : []
    lastUpdated.value = new Date()
  } catch (error) {
    console.error('Error fetching departments:', error)
  } finally {
    loading.value = false
  }
}

const startAutoRefresh = () => {
  // Initial fetch
  fetchDepartments()
  
  // Set up auto-refresh interval
  refreshInterval.value = setInterval(() => {
    fetchDepartments()
  }, REFRESH_INTERVAL)
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

const openAddDepartmentModal = () => {
  editingDepartment.value = null
  formData.value = { name: '', description: '', head: '' }
  showDepartmentModal.value = true
}

const editDepartment = (dept) => {
  editingDepartment.value = dept
  formData.value = {
    name: dept.name,
    description: dept.description,
    head: dept.head
  }
  showDepartmentModal.value = true
}

const saveDepartment = async () => {
  if (!formData.value.name.trim()) {
    alert('Please enter a department name')
    return
  }

  try {
    if (editingDepartment.value) {
      const updated = await departmentsService.updateDepartment(editingDepartment.value.id, formData.value)
      const index = departments.value.findIndex(d => d.id === editingDepartment.value.id)
      if (index !== -1) {
        departments.value[index] = updated
      }
    } else {
      const newDept = await departmentsService.createDepartment(formData.value)
      departments.value.push(newDept)
      lastUpdated.value = new Date()
    }
    closeModal()
  } catch (error) {
    console.error('Error saving department:', error)
    alert('Error saving department')
  }
}

const deleteDepartment = async (id) => {
  if (confirm('Are you sure you want to delete this department?')) {
    try {
      await departmentsService.deleteDepartment(id)
      departments.value = departments.value.filter(d => d.id !== id)
      lastUpdated.value = new Date()
    } catch (error) {
      console.error('Error deleting department:', error)
      alert('Error deleting department')
    }
  }
}

const closeModal = () => {
  showDepartmentModal.value = false
  editingDepartment.value = null
  formData.value = { name: '', description: '', head: '' }
}

onMounted(() => {
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>
