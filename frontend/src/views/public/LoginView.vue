<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12 relative overflow-hidden">
    <!-- Video Background -->
    <video
      ref="videoRef"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
      class="absolute inset-0 w-full h-full object-cover"
    >
      <source src="/login-bg.mp4" type="video/mp4" />
    </video>

    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/40"></div>

    <!-- Content -->
    <div class="w-full max-w-md relative z-10">
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
        <p class="mt-2 text-base text-slate-100">Sign in to your account</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <!-- Tabs -->
        <div class="flex gap-4 mb-8 border-b border-slate-200">
          <button
            @click="activeTab = 'employee'"
            :class="[
              'pb-4 px-4 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'employee'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            ]"
          >
            Employee
          </button>
          <button
            @click="activeTab = 'orgadmin'"
            :class="[
              'pb-4 px-4 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'orgadmin'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            ]"
          >
            Organization Admin
          </button>
          <button
            v-if="showSuperAdminTab"
            @click="activeTab = 'superadmin'"
            :class="[
              'pb-4 px-4 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'superadmin'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            ]"
          >
            Super Admin
          </button>
        </div>

        <!-- Employee Login -->
        <form v-if="activeTab === 'employee'" @submit.prevent="handleLogin('Employee')" class="flex flex-col gap-5">
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@company.com"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
              <router-link
                to="/forgot-password"
                class="text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                Forgot password?
              </router-link>
            </div>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="Enter your password"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all pr-10"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <EyeOff v-if="showPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <Transition name="fade">
            <div v-if="errorMessage" class="p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger-800 text-sm">
              {{ errorMessage }}
            </div>
          </Transition>

          <button type="submit" :disabled="isSubmitting" class="w-full bg-orange-600 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 inline animate-spin" />
            {{ isSubmitting ? 'Signing in...' : 'Sign in as Employee' }}
          </button>
        </form>

        <!-- Organization Admin Login -->
        <form v-if="activeTab === 'orgadmin'" @submit.prevent="handleLogin('Org_Admin')" class="flex flex-col gap-5">
          <div>
            <label for="org-email" class="block text-sm font-medium text-slate-700 mb-1.5">Organization Admin Email</label>
            <input
              id="org-email"
              v-model="orgAdminForm.email"
              type="email"
              required
              autocomplete="email"
              placeholder="admin@company.com"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="org-password" class="block text-sm font-medium text-slate-700">Password</label>
              <router-link
                to="/forgot-password"
                class="text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                Forgot password?
              </router-link>
            </div>
            <div class="relative">
              <input
                id="org-password"
                v-model="orgAdminForm.password"
                :type="showOrgPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="Enter your password"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all pr-10"
              />
              <button
                type="button"
                @click="showOrgPassword = !showOrgPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <EyeOff v-if="showOrgPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <Transition name="fade">
            <div v-if="orgAdminErrorMessage" class="p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger-800 text-sm">
              {{ orgAdminErrorMessage }}
            </div>
          </Transition>

          <button type="submit" :disabled="isOrgAdminSubmitting" class="w-full bg-orange-600 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <Loader2 v-if="isOrgAdminSubmitting" class="mr-2 h-4 w-4 inline animate-spin" />
            {{ isOrgAdminSubmitting ? 'Signing in...' : 'Sign in to Admin Panel' }}
          </button>
        </form>

        <!-- Super Admin Login (Hidden unless special access) -->
        <form v-if="activeTab === 'superadmin' && showSuperAdminTab" @submit.prevent="handleLogin('Super_Admin')" class="flex flex-col gap-5">
          <div>
            <label for="sa-email" class="block text-sm font-medium text-slate-700 mb-1.5">Super Admin Email</label>
            <input
              id="sa-email"
              v-model="superAdminForm.email"
              type="email"
              required
              autocomplete="email"
              placeholder="superadmin@platform.com"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          <div>
            <label for="sa-password" class="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div class="relative">
              <input
                id="sa-password"
                v-model="superAdminForm.password"
                :type="showSuperAdminPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="Enter your password"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all pr-10"
              />
              <button
                type="button"
                @click="showSuperAdminPassword = !showSuperAdminPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <EyeOff v-if="showSuperAdminPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <Transition name="fade">
            <div v-if="superAdminErrorMessage" class="p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger-800 text-sm">
              {{ superAdminErrorMessage }}
            </div>
          </Transition>

          <button type="submit" :disabled="isSuperAdminSubmitting" class="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <Loader2 v-if="isSuperAdminSubmitting" class="mr-2 h-4 w-4 inline animate-spin" />
            {{ isSuperAdminSubmitting ? 'Signing in...' : 'Sign in (System Admin)' }}
          </button>
        </form>
      </div>

      <!-- Footer -->
      <p class="mt-6 text-center text-sm text-slate-200">
        Don't have an account?
        <router-link to="/register" class="font-semibold text-orange-400 hover:text-orange-300 transition-colors">
          Register your organization
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Eye, EyeOff, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const videoRef = ref(null)

const activeTab = ref('employee')
const showPassword = ref(false)
const showOrgPassword = ref(false)
const showSuperAdminPassword = ref(false)
const isSubmitting = ref(false)
const isOrgAdminSubmitting = ref(false)
const isSuperAdminSubmitting = ref(false)
const errorMessage = ref('')
const orgAdminErrorMessage = ref('')
const superAdminErrorMessage = ref('')

// Super Admin tab only visible if accessed via special URL parameter
const showSuperAdminTab = computed(() => route.query.admin === 'true' || route.query.role === 'super_admin')

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.play().catch(() => {
      console.log('Video autoplay failed - user interaction may be required')
    })
  }
  
  // Check if user is coming from super admin registration form
  if (route.query.role === 'super_admin') {
    activeTab.value = 'superadmin'
  } else if (route.query.role === 'org_admin') {
    activeTab.value = 'orgadmin'
  } else if (route.query.role === 'employee') {
    activeTab.value = 'employee'
  }
})

const form = ref({
  email: '',
  password: '',
})

const orgAdminForm = ref({
  email: '',
  password: '',
})

const superAdminForm = ref({
  email: '',
  password: '',
})

async function handleLogin(userType) {
  // Clear error messages
  errorMessage.value = ''
  orgAdminErrorMessage.value = ''
  superAdminErrorMessage.value = ''

  // Set submitting state based on user type
  if (userType === 'Employee') {
    isSubmitting.value = true
  } else if (userType === 'Org_Admin') {
    isOrgAdminSubmitting.value = true
  } else if (userType === 'Super_Admin') {
    isSuperAdminSubmitting.value = true
  }

  try {
    const credentials = userType === 'Employee' 
      ? form.value 
      : userType === 'Org_Admin' 
      ? orgAdminForm.value 
      : superAdminForm.value

    // Pass userType to login
    await authStore.login({ ...credentials, userType })
    
    const redirect = route.query.redirect || authStore.dashboardRoute
    router.push(redirect)
  } catch (err) {
    const errorMsg = err.response?.data?.message || `${userType} login failed. Please try again.`
    
    if (userType === 'Employee') {
      errorMessage.value = errorMsg
    } else if (userType === 'Org_Admin') {
      orgAdminErrorMessage.value = errorMsg
    } else if (userType === 'Super_Admin') {
      superAdminErrorMessage.value = errorMsg
    }
  } finally {
    isSubmitting.value = false
    isOrgAdminSubmitting.value = false
    isSuperAdminSubmitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

