<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12 overflow-hidden bg-gradient-to-br from-slate-50 to-white">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Create Your Account</h2>
        <p class="mt-2 text-base text-slate-600">Register your organization and get started with attendance management</p>
      </div>

      <!-- Registration Card -->
      <div class="bg-white rounded-2xl border border-orange-400 p-8 shadow-sm">
        <!-- Tabs -->
        <div class="flex gap-4 mb-8 border-b border-slate-200">
          <button
            @click="activeTab = 'organization'"
            :class="[
              'pb-4 px-4 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'organization'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            ]"
          >
            Organization
          </button>
          <button
            v-if="showSuperAdminTab"
            @click="activeTab = 'superadmin'"
            :class="[
              'pb-4 px-4 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'superadmin'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            ]"
          >
            Super Admin
          </button>
        </div>

        <!-- Organization Registration -->
        <form v-if="activeTab === 'organization'" @submit.prevent="handleRegister" class="flex flex-col gap-6">
          <!-- Organization Section -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wider">📋 Organization Details</h3>

            <!-- Organization Name -->
            <div>
              <label for="orgName" class="block text-sm font-medium text-slate-700 mb-1.5">
                Organization Name <span class="text-red-600">*</span>
              </label>
              <input
                id="orgName"
                v-model="form.orgName"
                type="text"
                required
                placeholder="Acme Corporation"
                class="w-full px-4 py-2.5 rounded-lg border border-orange-400 text-slate-900 placeholder-slate-500 focus:border-orange-600 focus:ring-2 focus:ring-orange-200 transition-all"
              />
              <p class="text-xs text-slate-500 mt-1">The official name of your company</p>
            </div>

            <!-- Organization Phone (Optional) -->
            <div>
              <label for="phone" class="block text-sm font-medium text-slate-700 mb-1.5">
                Organization Phone <span class="text-slate-400">(optional)</span>
              </label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-orange-600 focus:ring-2 focus:ring-orange-200 transition-all"
              />
              <p class="text-xs text-slate-500 mt-1">Main contact number for your organization</p>
            </div>

            <!-- Organization Address (Optional) -->
            <div>
              <label for="address" class="block text-sm font-medium text-slate-700 mb-1.5">
                Organization Address <span class="text-slate-400">(optional)</span>
              </label>
              <input
                id="address"
                v-model="form.address"
                type="text"
                placeholder="123 Business St, Suite 100"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-orange-600 focus:ring-2 focus:ring-orange-200 transition-all"
              />
              <p class="text-xs text-slate-500 mt-1">Physical location of your organization</p>
            </div>
          </div>

          <!-- Admin Account Section -->
          <div class="space-y-4 border-t border-orange-400 pt-6">
            <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wider">👤 Admin Account Details</h3>
            <p class="text-sm text-slate-600">This account will have full administrative access</p>

            <!-- First and Last Name -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-slate-700 mb-1.5">
                  First Name <span class="text-red-600">*</span>
                </label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                  placeholder="John"
                  class="w-full px-4 py-2.5 rounded-lg border border-orange-400 text-slate-900 placeholder-slate-500 focus:border-orange-600 focus:ring-2 focus:ring-orange-200 transition-all"
                />
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-slate-700 mb-1.5">
                  Last Name <span class="text-red-600">*</span>
                </label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                  placeholder="Doe"
                  class="w-full px-4 py-2.5 rounded-lg border border-orange-400 text-slate-900 placeholder-slate-500 focus:border-orange-600 focus:ring-2 focus:ring-orange-200 transition-all"
                />
              </div>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address <span class="text-red-600">*</span>
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                autocomplete="email"
                placeholder="admin@company.com"
                class="w-full px-4 py-2.5 rounded-lg border border-orange-400 text-slate-900 placeholder-slate-500 focus:border-orange-600 focus:ring-2 focus:ring-orange-200 transition-all"
              />
              <p class="text-xs text-slate-500 mt-1">Used to log in to your admin account</p>
            </div>

            <!-- Password Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="password" class="block text-sm font-medium text-slate-700 mb-1.5">
                  Password <span class="text-red-600">*</span>
                </label>
                <div class="relative">
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    minlength="8"
                    placeholder="Min. 8 characters"
                    class="w-full px-4 py-2.5 rounded-lg border border-orange-400 text-slate-900 placeholder-slate-500 focus:border-orange-600 focus:ring-2 focus:ring-orange-200 transition-all pr-10"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <span v-if="showPassword" class="text-sm">Hide</span>
                    <span v-else class="text-sm">Show</span>
                  </button>
                </div>
                <p class="text-xs text-slate-500 mt-1">At least 8 characters</p>
              </div>
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm Password <span class="text-red-600">*</span>
                </label>
                <div class="relative">
                  <input
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    required
                    placeholder="Repeat password"
                    class="w-full px-4 py-2.5 rounded-lg border border-orange-400 text-slate-900 placeholder-slate-500 focus:border-orange-600 focus:ring-2 focus:ring-orange-200 transition-all pr-10"
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <span v-if="showConfirmPassword" class="text-sm">Hide</span>
                    <span v-else class="text-sm">Show</span>
                  </button>
                </div>
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
                <a href="#" class="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                  Terms & Conditions
                </a>
                and
                <a href="#" class="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>

          <!-- Messages -->
          <Transition name="fade">
            <div v-if="errorMessage" class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              <strong>Error:</strong> {{ errorMessage }}
            </div>
          </Transition>

          <Transition name="fade">
            <div v-if="successMessage" class="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
              <strong>Success!</strong> {{ successMessage }}
            </div>
          </Transition>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isSubmitting || !form.agreeToTerms"
            class="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <span v-if="isSubmitting" class="inline-block animate-spin">⏳</span>
            {{ isSubmitting ? 'Creating Account...' : 'Create Organization Account' }}
          </button>
        </form>

        <!-- Super Admin Registration -->
        <form v-if="activeTab === 'superadmin' && showSuperAdminTab" @submit.prevent="handleSuperAdminRegister" class="flex flex-col gap-6">
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-red-900 uppercase tracking-wider">🛡️ System Administrator Account</h3>
            <p class="text-sm text-slate-600">Create a new Super Admin account for platform administration</p>

            <!-- First and Last Name -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="sa-firstName" class="block text-sm font-medium text-slate-700 mb-1.5">
                  First Name <span class="text-red-600">*</span>
                </label>
                <input
                  id="sa-firstName"
                  v-model="superAdminForm.firstName"
                  type="text"
                  required
                  placeholder="John"
                  class="w-full px-4 py-2.5 rounded-lg border border-red-300 text-slate-900 placeholder-slate-500 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all"
                />
              </div>
              <div>
                <label for="sa-lastName" class="block text-sm font-medium text-slate-700 mb-1.5">
                  Last Name <span class="text-red-600">*</span>
                </label>
                <input
                  id="sa-lastName"
                  v-model="superAdminForm.lastName"
                  type="text"
                  required
                  placeholder="Admin"
                  class="w-full px-4 py-2.5 rounded-lg border border-red-300 text-slate-900 placeholder-slate-500 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all"
                />
              </div>
            </div>

            <!-- Email -->
            <div>
              <label for="sa-email" class="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address <span class="text-red-600">*</span>
              </label>
              <input
                id="sa-email"
                v-model="superAdminForm.email"
                type="email"
                required
                placeholder="superadmin@platform.com"
                class="w-full px-4 py-2.5 rounded-lg border border-red-300 text-slate-900 placeholder-slate-500 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all"
              />
            </div>

            <!-- Password -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="sa-password" class="block text-sm font-medium text-slate-700 mb-1.5">
                  Password <span class="text-red-600">*</span>
                </label>
                <div class="relative">
                  <input
                    id="sa-password"
                    v-model="superAdminForm.password"
                    :type="showSuperAdminPassword ? 'text' : 'password'"
                    required
                    minlength="8"
                    placeholder="Min. 8 characters"
                    class="w-full px-4 py-2.5 rounded-lg border border-red-300 text-slate-900 placeholder-slate-500 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all pr-10"
                  />
                  <button
                    type="button"
                    @click="showSuperAdminPassword = !showSuperAdminPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <span v-if="showSuperAdminPassword" class="text-sm">Hide</span>
                    <span v-else class="text-sm">Show</span>
                  </button>
                </div>
              </div>
              <div>
                <label for="sa-confirmPassword" class="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm Password <span class="text-red-600">*</span>
                </label>
                <div class="relative">
                  <input
                    id="sa-confirmPassword"
                    v-model="superAdminForm.confirmPassword"
                    :type="showSuperAdminConfirmPassword ? 'text' : 'password'"
                    required
                    placeholder="Repeat password"
                    class="w-full px-4 py-2.5 rounded-lg border border-red-300 text-slate-900 placeholder-slate-500 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all pr-10"
                  />
                  <button
                    type="button"
                    @click="showSuperAdminConfirmPassword = !showSuperAdminConfirmPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <span v-if="showSuperAdminConfirmPassword" class="text-sm">Hide</span>
                    <span v-else class="text-sm">Show</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Admin Secret Key -->
            <div>
              <label for="sa-adminSecret" class="block text-sm font-medium text-slate-700 mb-1.5">
                Admin Secret Key <span class="text-red-600">*</span>
              </label>
              <input
                id="sa-adminSecret"
                v-model="superAdminForm.adminSecret"
                type="password"
                required
                placeholder="Enter admin secret key"
                class="w-full px-4 py-2.5 rounded-lg border border-red-300 text-slate-900 placeholder-slate-500 focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-all"
              />
              <p class="text-xs text-slate-500 mt-1">Required security key for Super Admin registration</p>
            </div>
          </div>

          <!-- Messages -->
          <Transition name="fade">
            <div v-if="superAdminErrorMessage" class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              <strong>Error:</strong> {{ superAdminErrorMessage }}
            </div>
          </Transition>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isSuperAdminSubmitting"
            class="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <span v-if="isSuperAdminSubmitting" class="inline-block animate-spin">⏳</span>
            {{ isSuperAdminSubmitting ? 'Creating Account...' : 'Create Super Admin Account' }}
          </button>
        </form>
      </div>

      <!-- Footer -->
      <p class="mt-6 text-center text-sm text-slate-600">
        Already have an account?
        <router-link 
          :to="activeTab === 'organization' ? '/login?role=org_admin' : '/login?role=super_admin'" 
          :class="[
            'font-semibold transition-colors',
            activeTab === 'organization' ? 'text-orange-600 hover:text-orange-700' : 'text-red-600 hover:text-red-700'
          ]"
        >
          {{ activeTab === 'organization' ? 'Sign in as Organization Admin' : 'Sign in as Super Admin' }}
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeTab = ref('organization')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showSuperAdminPassword = ref(false)
const showSuperAdminConfirmPassword = ref(false)
const isSubmitting = ref(false)
const isSuperAdminSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const superAdminErrorMessage = ref('')

// Super Admin tab only visible if accessed via special URL parameter
const showSuperAdminTab = computed(() => route.query.admin === 'true')

const form = ref({
  orgName: '',
  phone: '',
  address: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
})

const superAdminForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  adminSecret: '',
})

async function handleRegister() {
  errorMessage.value = ''
  successMessage.value = ''

  // Validation
  if (!form.value.orgName.trim()) {
    errorMessage.value = 'Organization name is required'
    return
  }

  if (!form.value.firstName.trim() || !form.value.lastName.trim()) {
    errorMessage.value = 'First name and last name are required'
    return
  }

  if (!form.value.email.trim()) {
    errorMessage.value = 'Email address is required'
    return
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email.trim())) {
    errorMessage.value = 'Please enter a valid email address (e.g., admin@company.com)'
    return
  }

  if (form.value.password.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long'
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  if (!form.value.agreeToTerms) {
    errorMessage.value = 'You must agree to the terms and conditions'
    return
  }

  isSubmitting.value = true

  try {
    // Send registration data to backend
    const registrationData = {
      orgName: form.value.orgName.trim(),
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      email: form.value.email.trim(),
      password: form.value.password,
      phone: form.value.phone.trim() || null,
      address: form.value.address.trim() || null,
    }

    await authStore.registerOrganization(registrationData)
    
    successMessage.value = 'Organization account created successfully! Redirecting to login...'
    
    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    console.error('Registration error:', err)
    console.error('Error response:', err.response?.data)
    console.error('Error message:', err.message)
    errorMessage.value =
      err.response?.data?.message || 
      err.message || 
      'Registration failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleSuperAdminRegister() {
  superAdminErrorMessage.value = ''

  // Validation
  if (!superAdminForm.value.firstName.trim()) {
    superAdminErrorMessage.value = 'First name is required'
    return
  }

  if (!superAdminForm.value.lastName.trim()) {
    superAdminErrorMessage.value = 'Last name is required'
    return
  }

  if (!superAdminForm.value.email.trim()) {
    superAdminErrorMessage.value = 'Email address is required'
    return
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(superAdminForm.value.email.trim())) {
    superAdminErrorMessage.value = 'Please enter a valid email address (e.g., admin@company.com)'
    return
  }

  if (superAdminForm.value.password.length < 8) {
    superAdminErrorMessage.value = 'Password must be at least 8 characters long'
    return
  }

  if (superAdminForm.value.password !== superAdminForm.value.confirmPassword) {
    superAdminErrorMessage.value = 'Passwords do not match'
    return
  }

  if (!superAdminForm.value.adminSecret.trim()) {
    superAdminErrorMessage.value = 'Admin secret key is required'
    return
  }

  isSuperAdminSubmitting.value = true

  try {
    const registrationData = {
      firstName: superAdminForm.value.firstName.trim(),
      lastName: superAdminForm.value.lastName.trim(),
      email: superAdminForm.value.email.trim(),
      password: superAdminForm.value.password,
      adminSecret: superAdminForm.value.adminSecret.trim(),
    }

    await authStore.registerSuperAdmin(registrationData)
    
    const successMsg = 'Super Admin account created successfully! Redirecting to login...'
    successMessage.value = successMsg
    
    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/login?admin=true')
    }, 2000)
  } catch (err) {
    console.error('Super Admin registration error:', err)
    superAdminErrorMessage.value =
      err.response?.data?.message || 
      err.message || 
      'Super Admin registration failed. Please try again.'
  } finally {
    isSuperAdminSubmitting.value = false
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


