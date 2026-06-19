<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Employee Management</h1>
        <p class="text-gray-600 mt-2">Manage all employees in your organization</p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        + Add Employee
      </button>
    </div>

    <!-- Filters -->
    <div class="flex gap-4 items-center bg-white p-4 rounded-lg border border-gray-200">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name, email, or ID..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
      />
      <select
        v-model="filterDepartment"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
      >
        <option value="">All Departments</option>
        <option v-for="dept in departments" :key="dept.id" :value="dept.id">
          {{ dept.name }}
        </option>
      </select>
      <select
        v-model="filterStatus"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <!-- Employees Table -->
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Department</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Position</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="employee in filteredEmployees" :key="employee.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img
                  :src="employee.avatar || 'https://via.placeholder.com/40'"
                  :alt="employee.firstName"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <span class="font-medium text-gray-900">{{ employee.firstName }} {{ employee.lastName }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ employee.email }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ employee.departmentName || 'N/A' }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ employee.position || 'N/A' }}</td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  employee.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ employee.status === 'active' ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm space-x-2">
              <button
                @click="editEmployee(employee)"
                class="text-primary-600 hover:text-primary-900 font-medium"
              >
                Edit
              </button>
              <button
                @click="deleteEmployee(employee.id)"
                class="text-danger-600 hover:text-danger-900 font-medium"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-white">{{ editingEmployee ? 'Edit Employee' : 'Add New Employee' }}</h2>
          <button @click="closeModal" class="text-white hover:text-primary-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveEmployee" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              v-model="form.firstName"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="John"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              v-model="form.lastName"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Doe"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              v-model="form.departmentId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">Select Department</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              v-model="form.position"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Manager"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="form.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const showAddModal = ref(false)
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const filterDepartment = ref('')
const filterStatus = ref('')
const editingEmployee = ref(null)

const employees = ref([])
const departments = ref([])

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  departmentId: '',
  position: '',
  phone: '',
  status: 'active'
})

const filteredEmployees = computed(() => {
  return employees.value.filter(emp => {
    const matchSearch = searchQuery.value.toLowerCase()
      ? emp.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.value.toLowerCase())
      : true

    const matchDept = filterDepartment.value ? emp.departmentId === filterDepartment.value : true
    const matchStatus = filterStatus.value ? emp.status === filterStatus.value : true

    return matchSearch && matchDept && matchStatus
  })
})

async function fetchEmployees() {
  try {
    // Mock data - replace with API call
    employees.value = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        departmentId: 1,
        departmentName: 'Engineering',
        position: 'Senior Developer',
        phone: '+1 (555) 001-0001',
        status: 'active',
        avatar: 'https://via.placeholder.com/40'
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        departmentId: 2,
        departmentName: 'Sales',
        position: 'Sales Manager',
        phone: '+1 (555) 001-0002',
        status: 'active',
        avatar: 'https://via.placeholder.com/40'
      }
    ]
  } catch (err) {
    error.value = 'Failed to fetch employees'
  }
}

async function fetchDepartments() {
  try {
    // Mock data - replace with API call
    departments.value = [
      { id: 1, name: 'Engineering' },
      { id: 2, name: 'Sales' },
      { id: 3, name: 'HR' },
      { id: 4, name: 'Finance' }
    ]
  } catch (err) {
    error.value = 'Failed to fetch departments'
  }
}

function editEmployee(employee) {
  editingEmployee.value = employee
  form.value = { ...employee }
  showAddModal.value = true
}

async function saveEmployee() {
  loading.value = true
  error.value = ''
  try {
    // Mock API call - replace with actual API
    if (editingEmployee.value) {
      const index = employees.value.findIndex(e => e.id === editingEmployee.value.id)
      if (index >= 0) {
        employees.value[index] = { ...editingEmployee.value, ...form.value }
      }
    } else {
      employees.value.push({
        id: Date.now(),
        ...form.value
      })
    }
    
    closeModal()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function deleteEmployee(id) {
  if (confirm('Are you sure you want to delete this employee?')) {
    employees.value = employees.value.filter(e => e.id !== id)
  }
}

function closeModal() {
  showAddModal.value = false
  editingEmployee.value = null
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    departmentId: '',
    position: '',
    phone: '',
    status: 'active'
  }
  error.value = ''
}

onMounted(() => {
  fetchEmployees()
  fetchDepartments()
})
</script>
