<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Department Management</h1>
        <p class="text-gray-600 mt-2">Create and manage organization departments</p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        + Add Department
      </button>
    </div>

    <!-- Departments Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="dept in departments"
        :key="dept.id"
        class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ dept.name }}</h3>
          <div class="flex gap-2">
            <button
              @click="editDept(dept)"
              class="text-primary-600 hover:text-primary-900 text-sm font-medium"
            >
              Edit
            </button>
            <button
              @click="deleteDept(dept.id)"
              class="text-danger-600 hover:text-danger-900 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>

        <p v-if="dept.description" class="text-gray-600 text-sm mb-4">{{ dept.description }}</p>

        <div class="space-y-2 text-sm text-gray-600">
          <div>
            <span class="font-medium">Manager:</span> {{ dept.managerName || 'Not assigned' }}
          </div>
          <div>
            <span class="font-medium">Employees:</span> {{ dept.employeeCount || 0 }}
          </div>
          <div>
            <span class="font-medium">Budget:</span> ${{ formatNumber(dept.budget || 0) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-white">{{ editingDept ? 'Edit Department' : 'Add New Department' }}</h2>
          <button @click="closeModal" class="text-white hover:text-primary-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveDept" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Engineering"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="form.description"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Department description"
              rows="3"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Manager</label>
            <select
              v-model="form.managerId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">Select Manager</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.firstName }} {{ emp.lastName }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Budget</label>
            <input
              v-model="form.budget"
              type="number"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="0"
            />
          </div>

          <div v-if="error" class="p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-sm">
            {{ error }}
          </div>

          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 transition-colors font-medium"
            >
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
const editingDept = ref(null)

const departments = ref([])
const employees = ref([])

const form = ref({
  name: '',
  description: '',
  managerId: '',
  budget: 0
})

function formatNumber(num) {
  return new Intl.NumberFormat().format(num)
}

async function fetchDepartments() {
  try {
    departments.value = [
      {
        id: 1,
        name: 'Engineering',
        description: 'Software development and technical infrastructure',
        managerId: 1,
        managerName: 'John Doe',
        employeeCount: 12,
        budget: 500000
      },
      {
        id: 2,
        name: 'Sales',
        description: 'Sales and business development',
        managerId: 2,
        managerName: 'Jane Smith',
        employeeCount: 8,
        budget: 300000
      },
      {
        id: 3,
        name: 'HR',
        description: 'Human Resources',
        managerId: 3,
        managerName: 'Bob Wilson',
        employeeCount: 4,
        budget: 150000
      }
    ]
  } catch (err) {
    error.value = 'Failed to fetch departments'
  }
}

async function fetchEmployees() {
  try {
    employees.value = [
      { id: 1, firstName: 'John', lastName: 'Doe' },
      { id: 2, firstName: 'Jane', lastName: 'Smith' },
      { id: 3, firstName: 'Bob', lastName: 'Wilson' }
    ]
  } catch (err) {
    error.value = 'Failed to fetch employees'
  }
}

function editDept(dept) {
  editingDept.value = dept
  form.value = { ...dept }
  showAddModal.value = true
}

async function saveDept() {
  loading.value = true
  error.value = ''
  try {
    if (editingDept.value) {
      const index = departments.value.findIndex(d => d.id === editingDept.value.id)
      if (index >= 0) {
        departments.value[index] = { ...editingDept.value, ...form.value }
      }
    } else {
      departments.value.push({
        id: Date.now(),
        ...form.value,
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

async function deleteDept(id) {
  if (confirm('Are you sure you want to delete this department?')) {
    departments.value = departments.value.filter(d => d.id !== id)
  }
}

function closeModal() {
  showAddModal.value = false
  editingDept.value = null
  form.value = {
    name: '',
    description: '',
    managerId: '',
    budget: 0
  }
  error.value = ''
}

onMounted(() => {
  fetchDepartments()
  fetchEmployees()
})
</script>
