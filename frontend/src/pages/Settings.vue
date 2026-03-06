<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Settings</h1>
      <p class="text-slate-600 mt-1">Manage your organization settings and preferences</p>
    </div>

    <!-- Settings Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Sidebar Navigation -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <nav class="space-y-2">
            <button
              v-for="section in sections"
              :key="section.id"
              @click="selectedSection = section.id"
              :class="[
                'w-full text-left px-4 py-2 rounded-lg transition-colors',
                selectedSection === section.id
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-700 hover:bg-orange-50'
              ]"
            >
              {{ section.title }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Settings Content -->
      <div class="lg:col-span-2">
        <!-- Organization Settings -->
        <div v-if="selectedSection === 'organization'" class="bg-white rounded-xl shadow-sm border border-primary-100 p-6">
          <h2 class="text-xl font-bold text-dark-900 mb-4">Organization Settings</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
              <input
                v-model="orgSettings.name"
                type="text"
                class="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="orgSettings.email"
                type="email"
                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                v-model="orgSettings.phone"
                type="tel"
                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <input
                v-model="orgSettings.industry"
                type="text"
                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button @click="saveOrgSettings" class="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
              Save Changes
            </button>
          </div>
        </div>

        <!-- Notification Settings -->
        <div v-if="selectedSection === 'notifications'" class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 class="text-xl font-bold text-slate-900 mb-4">Notification Settings</h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-slate-900">Daily Attendance Summary</p>
                <p class="text-sm text-slate-600">Receive daily attendance summaries</p>
              </div>
              <input
                v-model="notifications.dailyAttendance"
                type="checkbox"
                class="w-5 h-5 rounded border-slate-300 text-orange-500"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-slate-900">User Updates</p>
                <p class="text-sm text-slate-600">Notify when users are added or removed</p>
              </div>
              <input
                v-model="notifications.userUpdates"
                type="checkbox"
                class="w-5 h-5 rounded border-slate-300 text-orange-500"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-slate-900">System Alerts</p>
                <p class="text-sm text-slate-600">Receive critical system alerts</p>
              </div>
              <input
                v-model="notifications.systemAlerts"
                type="checkbox"
                class="w-5 h-5 rounded border-slate-300 text-orange-500"
              />
            </div>

            <button @click="saveNotifications" class="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
              Save Preferences
            </button>
          </div>
        </div>

        <!-- Security Settings -->
        <div v-if="selectedSection === 'security'" class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 class="text-xl font-bold text-slate-900 mb-4">Security Settings</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input
                v-model="security.currentPassword"
                type="password"
                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input
                v-model="security.newPassword"
                type="password"
                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <input
                v-model="security.confirmPassword"
                type="password"
                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button @click="changePassword" class="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
              Change Password
            </button>
          </div>
        </div>

        <!-- Billing Settings -->
        <div v-if="selectedSection === 'billing'" class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 class="text-xl font-bold text-slate-900 mb-4">Billing Settings</h2>

          <div class="space-y-4">
            <div>
              <p class="block text-sm font-medium text-slate-700 mb-2">Current Plan</p>
              <div class="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p class="font-medium text-orange-900">Premium Plan</p>
                <p class="text-sm text-orange-700">Unlimited users and features</p>
              </div>
            </div>

            <div>
              <p class="block text-sm font-medium text-slate-700 mb-2">Billing Cycle</p>
              <p class="text-slate-600">Monthly - Next billing date: March 15, 2026</p>
            </div>

            <button class="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
              Manage Billing
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedSection = ref('organization')

const sections = [
  { id: 'organization', title: 'Organization' },
  { id: 'notifications', title: 'Notifications' },
  { id: 'security', title: 'Security' },
  { id: 'billing', title: 'Billing' }
]

const orgSettings = ref({
  name: 'TrackTimi Organization',
  email: 'contact@tracktimi.com',
  phone: '+1 (555) 123-4567',
  industry: 'Technology'
})

const notifications = ref({
  dailyAttendance: true,
  userUpdates: true,
  systemAlerts: true
})

const security = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const saveOrgSettings = () => {
  console.log('Saving organization settings:', orgSettings.value)
  alert('Organization settings saved successfully!')
}

const saveNotifications = () => {
  console.log('Saving notification preferences:', notifications.value)
  alert('Notification preferences saved!')
}

const changePassword = () => {
  if (security.value.newPassword !== security.value.confirmPassword) {
    alert('Passwords do not match!')
    return
  }
  console.log('Changing password')
  alert('Password changed successfully!')
  security.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
}
</script>
