<template>
  <div>
    <AppHeader title="Organization Settings" subtitle="Manage your organization's details" />

    <div class="p-6 max-w-2xl">
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">Organization Details</h3>
        <form @submit.prevent="handleSave" class="flex flex-col gap-4">
          <div>
            <label for="orgName" class="label-text">Organization Name</label>
            <input
              id="orgName"
              v-model="form.name"
              type="text"
              required
              class="input-field mt-1.5"
            />
          </div>
          <div>
            <label for="orgEmail" class="label-text">Contact Email</label>
            <input
              id="orgEmail"
              v-model="form.email"
              type="email"
              class="input-field mt-1.5"
              placeholder="contact@organization.com"
            />
          </div>
          <div>
            <label for="orgPhone" class="label-text">Phone Number</label>
            <input
              id="orgPhone"
              v-model="form.phone"
              type="tel"
              class="input-field mt-1.5"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div>
            <label for="orgAddress" class="label-text">Address</label>
            <textarea
              id="orgAddress"
              v-model="form.address"
              rows="3"
              class="input-field mt-1.5"
              placeholder="123 Business Ave, Suite 100"
            ></textarea>
          </div>

          <!-- Logo URL -->
          <div class="border-t pt-4 mt-4">
            <h4 class="font-semibold text-slate-700 mb-3">Branding & Customization</h4>
            <div>
              <label for="logoUrl" class="label-text">Organization Logo URL</label>
              <input
                id="logoUrl"
                v-model="form.logoUrl"
                type="url"
                class="input-field mt-1.5"
                placeholder="https://example.com/logo.png"
              />
              <p class="text-xs text-slate-500 mt-1">PNG or JPG recommended</p>
              <div v-if="form.logoUrl" class="mt-2">
                <p class="text-xs font-medium mb-2">Preview:</p>
                <img :src="form.logoUrl" alt="Logo" class="h-12 object-contain" />
              </div>
            </div>

            <!-- Primary Theme Color -->
            <div class="mt-4">
              <label for="primaryColor" class="label-text">Primary Theme Color</label>
              <div class="flex gap-2 items-center mt-1.5">
                <input
                  id="primaryColor"
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
              <p class="text-xs text-slate-500 mt-1">Suggested: Orange (#ff6600), Black (#000000), White (#ffffff)</p>
            </div>

            <!-- Secondary Theme Color -->
            <div class="mt-4">
              <label for="secondaryColor" class="label-text">Secondary Theme Color</label>
              <div class="flex gap-2 items-center mt-1.5">
                <input
                  id="secondaryColor"
                  v-model="form.theme.secondary"
                  type="color"
                  class="h-10 w-16 cursor-pointer border border-slate-300 rounded"
                />
                <input
                  v-model="form.theme.secondary"
                  type="text"
                  placeholder="#000000"
                  class="input-field flex-1"
                />
              </div>
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

          <p v-if="successMessage" class="text-sm text-accent-700 bg-accent-50 rounded-lg px-3 py-2">
            {{ successMessage }}
          </p>
          <p v-if="errorMessage" class="text-sm text-danger-600 bg-danger-50 rounded-lg px-3 py-2">
            {{ errorMessage }}
          </p>

          <div>
            <button type="submit" :disabled="isSaving" class="btn-primary">
              <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
              Save Changes
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
import organizationService from '@/services/organizationService'
import { Loader2 } from 'lucide-vue-next'

const authStore = useAuthStore()

const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  logoUrl: '',
  theme: {
    primary: '#ff6600',
    secondary: '#000000',
    darkMode: false,
  },
})

const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function handleSave() {
  successMessage.value = ''
  errorMessage.value = ''
  isSaving.value = true

  try {
    // server infers org from token; id parameter not required
    const { data } = await organizationService.updateOrganization(form.value)
    successMessage.value = 'Organization settings updated successfully.'

    // update auth store so theme/logo change takes effect immediately
    if (data.organization) {
      authStore.user.organization = data.organization
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Failed to update settings.'
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  try {
    // fetch organization info (current user's org inferred server-side)
    const { data } = await organizationService.getOrganization()
    const org = data.organization || data
    if (org) {
      form.value = {
        name: org.name || '',
        email: org.email || '',
        phone: org.phone || '',
        address: org.address || '',
        logoUrl: org.logoUrl || '',
        theme: org.theme || {
          primary: '#ff6600',
          secondary: '#000000',
          darkMode: false,
        },
      }
    }
  } catch {
    // Will start with empty form
  }
})
</script>
