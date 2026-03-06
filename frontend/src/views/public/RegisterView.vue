<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12 overflow-hidden bg-gradient-to-br from-slate-50 to-white">
  
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Create your account</h2>
        <p class="mt-2 text-base text-slate-600">Register your organization and start managing attendance</p>
      </div>

      <!-- Registration Card -->
      <div class="bg-white rounded-2xl border border-orange-400 p-8 shadow-sm">
        <form @submit.prevent="handleRegister" class="flex flex-col gap-6">
          <!-- Organization Section -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wider px-1">Organization Details</h3>

            <!-- Organization Name -->
            <div>
              <label for="orgName" class="block text-sm font-medium text-slate-700 mb-1.5">
                Organization Name
              </label>
              <input
                id="orgName"
                v-model="form.orgName"
                type="text"
                required
                placeholder="Acme Corporation"
                class="w-full px-4 py-2.5 rounded-lg border border-orange-400 text-slate-900 placeholder-slate-500 focus:border-primary-600 focus:ring-2 focus:ring-orange-300 transition-all"
              />
            </div>

            <!-- Organization Size -->
            <div>
              <label for="orgSize" class="block text-sm font-medium text-slate-700 mb-1.5">
                Organization Size
              </label>
              <select
                id="orgSize"
                v-model="form.orgSize"
                required
                class="w-full px-4 py-2.5 rounded-lg border border-orange-400 text-slate-900 focus:border-orange-400 focus:ring-2 focus:ring-primary-100 transition-all bg-white"
              >
                <option value="">Select your organization size</option>
                <option value="startup">Startup (1-25 employees)</option>
                <option value="small">Small (26-100 employees)</option>
                <option value="medium">Medium (101-500 employees)</option>
                <option value="large">Large (501-1000 employees)</option>
                <option value="enterprise">Enterprise (1000+ employees)</option>
              </select>
            </div>

            <!-- Logo Upload -->
            <div>
              <label for="logo" class="block text-sm font-medium text-slate-700 mb-1.5">
                Organization Logo
              </label>
              <div class="space-y-3">
                <div class="flex items-center gap-4">
                  <div v-if="logoPreview" class="w-20 h-20 rounded-lg border border-orange-400 overflow-hidden bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <img :src="logoPreview" :alt="form.orgName" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-20 h-20 rounded-lg border-2 border-dashed border-orange-400 bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <input
                      id="logo"
                      type="file"
                      accept="image/*"
                      @change="handleLogoUpload"
                      class="w-full px-4 py-2.5 rounded-lg border border-orange-400 text-slate-900 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-orange-500 cursor-pointer"
                    />
                    <p class="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 2MB</p>
                  </div>
                </div>
                <button
                  v-if="logoPreview"
                  type="button"
                  @click="logoPreview = null; form.logo = null"
                  class="text-sm text-danger-600 hover:text-danger-700 font-medium transition-colors"
                >
                  Remove logo
                </button>
              </div>
            </div>

            <!-- Theme Color -->
            <div>
              <label for="themeColor" class="block text-sm font-medium text-slate-800 mb-1.5">
                Primary Theme Color
              </label>
              <div class="flex gap-3 items-center">
                <input
                  id="themeColor"
                  v-model="form.theme.primary"
                  type="color"
                  class="h-10 w-16 cursor-pointer border border-orange-400 rounded-lg"
                />
                <input
                  v-model="form.theme.primary"
                  type="text"
                  placeholder="#ff6600"
                  maxlength="7"
                  class="flex-1 px-4 py-2.5 rounded-lg border border-orange-400 text-slate-900 placeholder-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-primary-100 transition-all text-sm"
                />
              </div>
              <p class="text-xs text-slate-500 mt-1.5">Customize your dashboard appearance (defaults to orange)</p>
            </div>

            <!-- Dark Mode Toggle -->
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-orange-400">
              <input
                id="darkMode"
                v-model="form.theme.darkMode"
                type="checkbox"
                class="w-4 h-4 rounded border-orange-400 cursor-pointer accent-primary-600"
              />
              <label for="darkMode" class="flex-1 text-sm font-medium text-slate-800 cursor-pointer">
                Enable Dark Mode by Default
              </label>
            </div>
          </div>

          <!-- Admin Account Section -->
          <div class="space-y-4 border-t border-orange-400 pt-6">
            <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wider px-1">Admin Account</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-slate-800 mb-1.5">
                  First Name
                </label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                  placeholder="John"
                  class="w-full px-4 py-2.5 rounded-lg border border-orange-400 text-slate-900 placeholder-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-slate-700 mb-1.5">
                  Last Name
                </label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                  placeholder="Doe"
                  class="w-full px-4 py-2.5 rounded-lg border border-orange-400 text-slate-900 placeholder-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label for="regEmail" class="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                id="regEmail"
                v-model="form.email"
                type="email"
                required
                autocomplete="email"
                placeholder="admin@company.com"
                class="w-full px-4 py-2.5 rounded-lg border border-orange-400 text-slate-900 placeholder-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="regPassword" class="block text-sm font-medium text-slate-800 mb-1.5">
                  Password
                </label>
                <input
                  id="regPassword"
                  v-model="form.password"
                  type="password"
                  required
                  minlength="8"
                  placeholder="Min. 8 characters"
                  class="w-full px-4 py-2.5 rounded-lg border border-orange-400 text-slate-900 placeholder-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-slate-800 mb-1.5">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  type="password"
                  required
                  placeholder="Repeat password"
                  class="w-full px-4 py-2.5 rounded-lg border border-orange-400 text-slate-900 placeholder-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
            </div>
          </div>

          <!-- Terms & Conditions -->
          <div class="border-t border-orange-400 pt-6">
            <div class="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <input
                id="terms"
                v-model="form.agreeToTerms"
                type="checkbox"
                required
                class="mt-1 w-4 h-4 rounded border-orange-400 cursor-pointer accent-orange-500 flex-shrink-0"
              />
              <label for="terms" class="flex-1 text-sm text-slate-700 cursor-pointer">
                I agree to the
                <a href="#" class="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  Terms & Conditions
                </a>
                and
                <a href="#" class="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>

          <!-- Messages -->
          <Transition name="fade">
            <div v-if="errorMessage" class="p-4 rounded-lg bg-danger-50 border border-danger-200 text-danger-800 text-sm">
              {{ errorMessage }}
            </div>
          </Transition>

          <Transition name="fade">
            <div v-if="successMessage" class="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
              {{ successMessage }}
            </div>
          </Transition>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isSubmitting || !form.agreeToTerms"
            class="w-full btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 inline animate-spin" />
            {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>
      </div>

      <!-- Footer -->
      <p class="mt-6 text-center text-sm text-slate-600">
        Already have an account?
        <router-link to="/login" class="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
          Sign in
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  orgName: '',
  orgSize: '',
  logo: null,
  theme: {
    primary: '#ff6600',
    darkMode: false
  },
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
})

const logoPreview = ref(null)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleLogoUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    errorMessage.value = 'File size must be less than 2MB'
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please upload an image file'
    return
  }

  form.value.logo = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target?.result
  }
  reader.readAsDataURL(file)
}

async function handleRegister() {
  errorMessage.value = ''
  successMessage.value = ''

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  if (!form.value.agreeToTerms) {
    errorMessage.value = 'You must agree to the terms and conditions.'
    return
  }

  if (!form.value.orgSize) {
    errorMessage.value = 'Please select an organization size.'
    return
  }

  isSubmitting.value = true

  try {
    const { confirmPassword, ...data } = form.value
    await authStore.register(data)
    successMessage.value = 'Account created successfully! Redirecting to login...'
    setTimeout(() => router.push('/login'), 2000)
  } catch (err) {
    errorMessage.value =
      err.response?.data?.message || 'Registration failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

