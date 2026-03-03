<template>
  <div class="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
        <p class="mt-2 text-sm text-slate-600">Sign in to access your dashboard</p>
      </div>

      <div class="card p-8">
        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <div>
            <label for="email" class="label-text">Email address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@company.com"
              class="input-field mt-1.5"
            />
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="label-text">Password</label>
              <router-link
                to="/forgot-password"
                class="text-xs font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot password?
              </router-link>
            </div>
            <div class="relative mt-1.5">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="Enter your password"
                class="input-field pr-10"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <EyeOff v-if="showPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
                <span class="sr-only">Toggle password visibility</span>
              </button>
            </div>
          </div>

          <p v-if="errorMessage" class="text-sm text-danger-600 bg-danger-50 rounded-lg px-3 py-2">
            {{ errorMessage }}
          </p>

          <button type="submit" :disabled="isSubmitting" class="btn-primary w-full mt-1">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </div>

      <p class="mt-6 text-center text-sm text-slate-600">
        Don't have an account?
        <router-link to="/register" class="font-semibold text-primary-600 hover:text-primary-500">
          Register your organization
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Eye, EyeOff, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
})
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await authStore.login(form.value)
    const redirect = route.query.redirect || authStore.dashboardRoute
    router.push(redirect)
  } catch (err) {
    errorMessage.value =
      err.response?.data?.message || 'Invalid credentials. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
