<template>
  <div class="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
          <KeyRound class="h-6 w-6 text-primary-600" />
        </div>
        <h2 class="text-2xl font-bold tracking-tight text-slate-900">Forgot your password?</h2>
        <p class="mt-2 text-sm text-slate-600">Enter your email and we'll send you reset instructions.</p>
      </div>

      <div class="card p-8">
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
          <div>
            <label for="email" class="label-text">Email address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@company.com"
              class="input-field mt-1.5"
            />
          </div>

          <p v-if="successMessage" class="text-sm text-accent-700 bg-accent-50 rounded-lg px-3 py-2">
            {{ successMessage }}
          </p>

          <p v-if="errorMessage" class="text-sm text-danger-600 bg-danger-50 rounded-lg px-3 py-2">
            {{ errorMessage }}
          </p>

          <button type="submit" :disabled="isSubmitting" class="btn-primary w-full">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ isSubmitting ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>
      </div>

      <p class="mt-6 text-center text-sm text-slate-600">
        Remember your password?
        <router-link to="/login" class="font-semibold text-primary-600 hover:text-primary-500">
          Back to sign in
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import authService from '@/services/authService'
import { KeyRound, Loader2 } from 'lucide-vue-next'

const email = ref('')
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  // the backend does not yet support password reset logic, so show a
  // friendly message instead of attempting a call that will 404.
  successMessage.value =
    'This feature isn\'t available yet. Please contact your administrator.'
}
</script>
