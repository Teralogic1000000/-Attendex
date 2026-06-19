<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Card -->
      <div class="bg-white rounded-lg shadow-xl p-8">
        <!-- Logo/Title -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Attendex</h1>
          <p class="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <!-- User Type Selector -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Login As</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="type in userTypes"
              :key="type.value"
              type="button"
              @click="credentials.userType = type.value"
              :class="[
                'py-2 px-3 rounded-lg text-xs font-medium transition',
                credentials.userType === type.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ type.label }}
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-2">Current: {{ getTypeLabel(credentials.userType) }}</p>
        </div>

        <!-- Special Super Admin Instructions -->
        <div v-if="credentials.userType === 'Super_Admin'" class="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p class="text-xs text-purple-700">
            <strong>Super Admin Access:</strong> Contact system administrator for credential setup.
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              v-model="credentials.email"
              type="email"
              required
              placeholder="you@example.com"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="credentials.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
          </div>

          <!-- Remember Me -->
          <div class="flex items-center">
            <input
              id="remember"
              v-model="credentials.rememberMe"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label for="remember" class="ml-2 text-sm font-medium text-gray-700">
              Remember me
            </label>
          </div>

          <!-- Error Message -->
          <div v-if="errors.general" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ errors.general }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition duration-200"
          >
            <span v-if="!loading">Sign In</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <!-- Social Login -->
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
          <button
            type="button"
            class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>

        <!-- Sign Up Link -->
        <p class="text-center text-gray-600 text-sm mt-6">
          Don't have an account?
          <router-link to="/signup" class="text-blue-600 hover:text-blue-700 font-medium">
            Sign up
          </router-link>
        </p>

        <!-- Test Credentials -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <p class="text-xs text-gray-500 mb-2">Test Credentials:</p>
          <p class="text-xs text-gray-600">Email: superadmin@test.com</p>
          <p class="text-xs text-gray-600">Password: Admin123!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const userTypes = [
  { value: 'Employee', label: 'Employee' },
  { value: 'Org_Admin', label: 'Org Admin' },
  { value: 'Super_Admin', label: 'Super Admin' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Contractor', label: 'Contractor' },
  { value: 'Intern', label: 'Intern' }
]

const credentials = reactive({
  email: '',
  password: '',
  rememberMe: false,
  userType: 'Employee'
})

const showPassword = ref(false)
const loading = ref(false)
const errors = reactive({
  email: '',
  password: '',
  general: ''
})

const getTypeLabel = (value: string) => {
  const type = userTypes.find(t => t.value === value)
  return type?.label || value
}

const handleLogin = async () => {
  // Reset errors
  errors.email = ''
  errors.password = ''
  errors.general = ''

  // Validation
  if (!credentials.email) {
    errors.email = 'Email is required'
    return
  }
  if (!credentials.password) {
    errors.password = 'Password is required'
    return
  }

  loading.value = true

  try {
    const data = await authStore.login({
      email: credentials.email,
      password: credentials.password,
      userType: credentials.userType
    })

    notificationStore.success('Login successful! Redirecting...')

    // Redirect based on role
    const dashboardRoute = authStore.dashboardRoute
    setTimeout(() => {
      router.push(dashboardRoute)
    }, 500)
  } catch (error: any) {
    console.error('Login error:', error)
    const message = error.response?.data?.message || error.message || 'Login failed'
    errors.general = message
    notificationStore.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
input:focus {
  @apply ring-2 ring-blue-500 ring-opacity-50;
}
</style>
