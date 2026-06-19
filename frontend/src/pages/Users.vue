<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Users Management</h1>
        <p class="text-slate-600 mt-1">Manage your organization's team members</p>
      </div>
      <button
        @click="openAddUserModal"
        class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm hover:shadow-md"
      >
        + Add User
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="mb-6 flex flex-col md:flex-row gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name or email..."
        class="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
      />
      <select
        v-model="filterStatus"
        class="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
      >
        <option value="">All Status</option>
        <option value="ACTIVE">Active</option>
        <option value="DISABLED">Disabled</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
      <p class="text-slate-600 mt-4">Loading users...</p>
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-orange-400 overflow-hidden">
      <div v-if="filteredUsers.length === 0" class="p-8 text-center">
        <p class="text-slate-600">No users found. Start by adding your first user.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-orange-400">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700">Name</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600">Email</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600">Department</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="border-b border-slate-100 hover:bg-slate-50">
              <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ user.firstName }} {{ user.lastName }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ user.email }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ user.department || '-' }}</td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    user.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ user.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm space-x-2">
                <button @click="editUser(user)" class="text-orange-600 hover:text-orange-700 font-medium">Edit</button>
                <button @click="deleteUser(user.id)" class="text-red-600 hover:text-red-700 font-medium">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 w-full max-w-md max-h-screen overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6">{{ editingUser ? 'Edit User' : 'Add New User' }}</h2>

        <form @submit.prevent="saveUser">
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1">First Name</label>
            <input
              v-model="formData.firstName"
              type="text"
              required
              class="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
            <input
              v-model="formData.lastName"
              type="text"
              required
              class="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-orange-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div v-if="!editingUser" class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              v-model="formData.password"
              type="password"
              required
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <input
              v-model="formData.department"
              type="text"
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              v-model="formData.status"
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              {{ editingUser ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import userService from '@/services/userService'

const users = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filterStatus = ref('')
const showUserModal = ref(false)
const editingUser = ref(null)

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  department: '',
  status: 'ACTIVE'
})

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchSearch = !searchQuery.value ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchStatus = !filterStatus.value || user.status === filterStatus.value

    return matchSearch && matchStatus
  })
})

const fetchUsers = async () => {
  try {
    loading.value = true
    const data = await userService.getUsers()
    users.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

const openAddUserModal = () => {
  editingUser.value = null
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: '',
    status: 'ACTIVE'
  }
  showUserModal.value = true
}

const editUser = (user) => {
  editingUser.value = user
  formData.value = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: '',
    department: user.department || '',
    status: user.status
  }
  showUserModal.value = true
}

const saveUser = async () => {
  try {
    if (editingUser.value) {
      await userService.updateUser(editingUser.value.id, formData.value)
    } else {
      await userService.createUser(formData.value)
    }
    closeModal()
    fetchUsers()
  } catch (error) {
    console.error('Error saving user:', error)
    alert('Error saving user. Please try again.')
  }
}

const deleteUser = async (userId) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await userService.deleteUser(userId)
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user. Please try again.')
    }
  }
}

const closeModal = () => {
  showUserModal.value = false
  editingUser.value = null
}

onMounted(() => {
  fetchUsers()
})
</script>
