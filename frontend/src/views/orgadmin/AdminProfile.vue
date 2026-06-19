<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">Admin Profile</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Card -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
          <div class="relative inline-block mb-4">
            <img
              :src="profile.avatar || 'https://via.placeholder.com/120'"
              :alt="profile.firstName"
              class="w-24 h-24 rounded-full object-cover border-4 border-primary-200"
            />
            <button
              @click="showAvatarModal = true"
              class="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <h2 class="text-2xl font-bold text-gray-900">{{ profile.firstName }} {{ profile.lastName }}</h2>
          <p class="text-gray-600 text-sm mt-1">{{ profile.role }}</p>
          <p class="text-gray-500 text-sm mt-2">{{ profile.email }}</p>

          <div class="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
            <div>
              <span class="font-medium">Organization:</span> {{ profile.organization }}
            </div>
            <div>
              <span class="font-medium">Department:</span> {{ profile.department }}
            </div>
            <div>
              <span class="font-medium">Member Since:</span> {{ formatDate(profile.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Profile Form -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Edit Profile</h3>

          <form @submit.prevent="saveProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  v-model="editForm.firstName"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  v-model="editForm.lastName"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="editForm.email"
                type="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                v-model="editForm.phone"
                type="tel"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Position/Title</label>
              <input
                v-model="editForm.position"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                v-model="editForm.bio"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Tell us about yourself"
                rows="4"
              />
            </div>

            <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {{ successMessage }}
            </div>

            <div v-if="error" class="p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-sm">
              {{ error }}
            </div>

            <button
              type="submit"
              :disabled="saving"
              class="w-full px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Security & Settings -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Password Change -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>

        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              v-model="passwordForm.current"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              v-model="passwordForm.new"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              v-model="passwordForm.confirm"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <button
            type="submit"
            :disabled="passwordLoading"
            class="w-full px-6 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {{ passwordLoading ? 'Updating...' : 'Update Password' }}
          </button>
        </form>
      </div>

      <!-- Two-Factor Authentication -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>

        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">Two-Factor Authentication</p>
              <p class="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <div class="flex items-center">
              <span :class="['px-3 py-1 rounded-full text-xs font-medium', twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                {{ twoFactorEnabled ? 'Enabled' : 'Disabled' }}
              </span>
              <button
                @click="toggleTwoFactor"
                class="ml-4 text-primary-600 hover:text-primary-900 font-medium text-sm"
              >
                {{ twoFactorEnabled ? 'Disable' : 'Enable' }}
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">Active Sessions</p>
              <p class="text-sm text-gray-600">Manage your logged-in sessions</p>
            </div>
            <button class="text-primary-600 hover:text-primary-900 font-medium text-sm">
              View Sessions
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Avatar Upload Modal -->
    <div v-if="showAvatarModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Upload Avatar</h2>

        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <p class="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
          <p class="text-xs text-gray-500">PNG, JPG up to 10MB</p>
          <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="showAvatarModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            @click="uploadAvatar"
            :disabled="!newAvatar"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 font-medium"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const profile = ref({
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@techcorp.com',
  phone: '+1 (555) 000-0000',
  position: 'Organization Administrator',
  role: 'ORG_ADMIN',
  organization: 'Tech Corporation',
  department: 'Management',
  avatar: 'https://via.placeholder.com/120',
  bio: 'Leading the organization with vision and dedication.',
  createdAt: new Date('2023-01-15')
})

const editForm = ref({ ...profile.value })
const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

const saving = ref(false)
const passwordLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const showAvatarModal = ref(false)
const twoFactorEnabled = ref(false)
const newAvatar = ref(null)

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function saveProfile() {
  saving.value = true
  error.value = ''
  successMessage.value = ''
  try {
    Object.assign(profile.value, editForm.value)
    successMessage.value = 'Profile updated successfully!'
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err) {
    error.value = 'Failed to save profile'
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  passwordLoading.value = true
  error.value = ''
  try {
    if (passwordForm.value.new !== passwordForm.value.confirm) {
      error.value = 'Passwords do not match'
      return
    }
    successMessage.value = 'Password changed successfully!'
    passwordForm.value = { current: '', new: '', confirm: '' }
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err) {
    error.value = 'Failed to change password'
  } finally {
    passwordLoading.value = false
  }
}

function handleAvatarUpload(e) {
  const file = e.target.files?.[0]
  if (file) {
    newAvatar.value = file
  }
}

async function uploadAvatar() {
  if (!newAvatar.value) return
  // Mock upload
  const reader = new FileReader()
  reader.onload = (e) => {
    profile.value.avatar = e.target?.result
    editForm.value.avatar = e.target?.result
    showAvatarModal.value = false
    newAvatar.value = null
  }
  reader.readAsDataURL(newAvatar.value)
}

function toggleTwoFactor() {
  twoFactorEnabled.value = !twoFactorEnabled.value
  successMessage.value = `Two-factor authentication ${twoFactorEnabled.value ? 'enabled' : 'disabled'}`
  setTimeout(() => (successMessage.value = ''), 3000)
}
</script>
