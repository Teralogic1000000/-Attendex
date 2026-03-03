<template>
  <div class="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-12">
    <div class="w-full max-w-2xl">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold tracking-tight text-slate-900">Create your account</h2>
        <p class="mt-2 text-sm text-slate-600">Register your organization and start managing attendance</p>
      </div>

      <div class="card p-8">
        <form @submit.prevent="handleRegister" class="flex flex-col gap-6">
          <!-- Organization -->
          <div>
            <h3 class="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Organization</h3>
            <div>
              <label for="orgName" class="label-text">Organization Name</label>
              <input
                id="orgName"
                v-model="form.orgName"
                type="text"
                required
                placeholder="Acme Corporation"
                class="input-field mt-1.5"
              />
            </div>
            
            <!-- Logo URL -->
            <div class="mt-4">
              <label for="logoUrl" class="label-text">Organization Logo URL</label>
              <input
                id="logoUrl"
                v-model="form.logoUrl"
                type="url"
                placeholder="https://example.com/logo.png"
                class="input-field mt-1.5"
              />
              <p class="text-xs text-slate-500 mt-1">Optional: Paste your organization logo URL</p>
            </div>

            <!-- Theme Color -->
            <div class="mt-4">
              <label for="themeColor" class="label-text">Primary Theme Color</label>
              <div class="flex gap-2 items-center mt-1.5">
                <input
                  id="themeColor"
                  v-model="form.theme.primary"
                  type="color"
                  class="h-10 w-16 cursor-pointer border border-slate-300 rounded"
                />
                <input
                  v-model="form.theme.primary"
                  type="text"
                  placeholder="#ff6600"
                  class="input-field flex-1"
                />
              </div>
              <p class="text-xs text-slate-500 mt-1">Orange, black, white recommended. Defaults to orange (#ff6600)</p>
            </div>

            <!-- Dark Mode -->
            <div class="mt-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.theme.darkMode"
                  type="checkbox"
                  class="w-4 h-4 rounded border-slate-300"
                />
                <span class="label-text mb-0">Enable Dark Mode by Default</span>
              </label>
            </div>
          </div>

          <!-- Admin Account -->
          <div>
            <h3 class="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Admin Account</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="label-text">First Name</label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                  placeholder="John"
                  class="input-field mt-1.5"
                />
              </div>
              <div>
                <label for="lastName" class="label-text">Last Name</label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                  placeholder="Doe"
                  class="input-field mt-1.5"
                />
              </div>
            </div>
            <div class="mt-4">
              <label for="regEmail" class="label-text">Email address</label>
              <input
                id="regEmail"
                v-model="form.email"
                type="email"
                required
                autocomplete="email"
                placeholder="admin@company.com"
                class="input-field mt-1.5"
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label for="regPassword" class="label-text">Password</label>
                <input
                  id="regPassword"
                  v-model="form.password"
                  type="password"
                  required
                  minlength="8"
                  placeholder="Min. 8 characters"
                  class="input-field mt-1.5"
                />
              </div>
              <div>
                <label for="confirmPassword" class="label-text">Confirm Password</label>
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  type="password"
                  required
                  placeholder="Repeat password"
                  class="input-field mt-1.5"
                />
              </div>
            </div>
          </div>

          <p v-if="errorMessage" class="text-sm text-danger-600 bg-danger-50 rounded-lg px-3 py-2">
            {{ errorMessage }}
          </p>

          <p v-if="successMessage" class="text-sm text-accent-700 bg-accent-50 rounded-lg px-3 py-2">
            {{ successMessage }}
          </p>

          <button type="submit" :disabled="isSubmitting" class="btn-primary w-full">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ isSubmitting ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>
      </div>

      <p class="mt-6 text-center text-sm text-slate-600">
        Already have an account?
        <router-link to="/login" class="font-semibold text-primary-600 hover:text-primary-500">
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
  logoUrl: '',
  theme: {
    primary: '#ff6600',
    darkMode: false
  },
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleRegister() {
  errorMessage.value = ''
  successMessage.value = ''

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match.'
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
