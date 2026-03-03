<template>
  <div>
    <AppHeader title="Profile Settings" subtitle="Manage your personal information and password" />

    <div class="p-6 flex flex-col gap-6 max-w-2xl">
      <!-- Profile Info -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
        <form @submit.prevent="handleUpdateProfile" class="flex flex-col gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="label-text">First Name</label>
              <input
                id="firstName"
                v-model="profile.firstName"
                type="text"
                required
                class="input-field mt-1.5"
              />
            </div>
            <div>
              <label for="lastName" class="label-text">Last Name</label>
              <input
                id="lastName"
                v-model="profile.lastName"
                type="text"
                required
                class="input-field mt-1.5"
              />
            </div>
          </div>
          <div>
            <label for="email" class="label-text">Email</label>
            <input
              id="email"
              :value="authStore.user?.email"
              type="email"
              disabled
              class="input-field mt-1.5 bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p class="mt-1 text-xs text-slate-400">Email cannot be changed.</p>
          </div>

          <p v-if="profileSuccess" class="text-sm text-accent-700 bg-accent-50 rounded-lg px-3 py-2">
            {{ profileSuccess }}
          </p>
          <p v-if="profileError" class="text-sm text-danger-600 bg-danger-50 rounded-lg px-3 py-2">
            {{ profileError }}
          </p>

          <div>
            <button type="submit" :disabled="isUpdatingProfile" class="btn-primary">
              <Loader2 v-if="isUpdatingProfile" class="mr-2 h-4 w-4 animate-spin" />
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <!-- Change Password -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">Change Password</h3>
        <form @submit.prevent="handleChangePassword" class="flex flex-col gap-4">
          <div>
            <label for="currentPassword" class="label-text">Current Password</label>
            <input
              id="currentPassword"
              v-model="passwordForm.currentPassword"
              type="password"
              required
              placeholder="Enter current password"
              class="input-field mt-1.5"
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="newPassword" class="label-text">New Password</label>
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                type="password"
                required
                minlength="8"
                placeholder="Min. 8 characters"
                class="input-field mt-1.5"
              />
            </div>
            <div>
              <label for="confirmNewPassword" class="label-text">Confirm New Password</label>
              <input
                id="confirmNewPassword"
                v-model="passwordForm.confirmNewPassword"
                type="password"
                required
                placeholder="Repeat new password"
                class="input-field mt-1.5"
              />
            </div>
          </div>

          <p v-if="passwordSuccess" class="text-sm text-accent-700 bg-accent-50 rounded-lg px-3 py-2">
            {{ passwordSuccess }}
          </p>
          <p v-if="passwordError" class="text-sm text-danger-600 bg-danger-50 rounded-lg px-3 py-2">
            {{ passwordError }}
          </p>

          <div>
            <button type="submit" :disabled="isChangingPassword" class="btn-primary">
              <Loader2 v-if="isChangingPassword" class="mr-2 h-4 w-4 animate-spin" />
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'
import userService from '@/services/userService'
import { Loader2 } from 'lucide-vue-next'

const authStore = useAuthStore()

const profile = ref({
  firstName: '',
  lastName: '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

const isUpdatingProfile = ref(false)
const isChangingPassword = ref(false)
const profileSuccess = ref('')
const profileError = ref('')
const passwordSuccess = ref('')
const passwordError = ref('')

async function handleUpdateProfile() {
  profileSuccess.value = ''
  profileError.value = ''
  isUpdatingProfile.value = true

  try {
    await userService.updateUser(authStore.user.id, profile.value)
    // Update local auth store user data
    authStore.user.firstName = profile.value.firstName
    authStore.user.lastName = profile.value.lastName
    localStorage.setItem('user', JSON.stringify(authStore.user))
    profileSuccess.value = 'Profile updated successfully.'
  } catch (err) {
    profileError.value = err.response?.data?.message || 'Failed to update profile.'
  } finally {
    isUpdatingProfile.value = false
  }
}

async function handleChangePassword() {
  passwordSuccess.value = ''
  passwordError.value = ''

  if (passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword) {
    passwordError.value = 'New passwords do not match.'
    return
  }

  isChangingPassword.value = true

  try {
    await userService.changePassword(authStore.user.id, {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })
    passwordSuccess.value = 'Password changed successfully.'
    passwordForm.value = { currentPassword: '', newPassword: '', confirmNewPassword: '' }
  } catch (err) {
    passwordError.value = err.response?.data?.message || 'Failed to change password.'
  } finally {
    isChangingPassword.value = false
  }
}

onMounted(() => {
  if (authStore.user) {
    profile.value.firstName = authStore.user.firstName || ''
    profile.value.lastName = authStore.user.lastName || ''
  }
})
</script>
