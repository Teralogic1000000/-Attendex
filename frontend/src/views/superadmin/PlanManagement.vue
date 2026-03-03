<template>
  <div>
    <AppHeader title="Plan Management" subtitle="Create and manage subscription plans" />

    <div class="p-6">
      <BaseTable :columns="columns" :rows="superAdminStore.allPlans">
        <template #header>
          <div class="flex-1">
            <p class="text-sm text-slate-500">{{ superAdminStore.allPlans.length }} plans configured</p>
          </div>
          <button @click="openModal()" class="btn-primary">
            <Plus class="mr-1.5 h-4 w-4" />
            Create Plan
          </button>
        </template>

        <template #cell-name="{ row }">
          <p class="font-medium text-slate-900">{{ row.name }}</p>
        </template>

        <template #cell-price="{ row }">
          <p class="font-semibold text-slate-900">{{ formatCurrency(row.price || 0) }}</p>
          <p class="text-xs text-slate-500">per month</p>
        </template>

        <template #cell-maxUsers="{ row }">
          {{ row.maxUsers || row.max_users || 'Unlimited' }}
        </template>

        <template #cell-duration="{ row }">
          {{ row.duration || 30 }} days
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2">
            <button @click="openModal(row)" class="rounded-lg p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Edit">
              <Pencil class="h-4 w-4" />
              <span class="sr-only">Edit plan</span>
            </button>
            <button @click="handleDelete(row)" class="rounded-lg p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-colors" title="Delete">
              <Trash2 class="h-4 w-4" />
              <span class="sr-only">Delete plan</span>
            </button>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- Plan Form Modal -->
    <BaseModal
      :show="showModal"
      :title="editingPlan ? 'Edit Plan' : 'Create Plan'"
      @close="showModal = false"
    >
      <form @submit.prevent="handleSave" class="flex flex-col gap-4">
        <div>
          <label class="label-text">Plan Name</label>
          <input v-model="form.name" type="text" required placeholder="e.g. Pro" class="input-field mt-1.5" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label-text">Price (USD)</label>
            <input v-model.number="form.price" type="number" min="0" step="0.01" required class="input-field mt-1.5" />
          </div>
          <div>
            <label class="label-text">Max Users</label>
            <input v-model.number="form.maxUsers" type="number" min="1" required class="input-field mt-1.5" />
          </div>
        </div>
        <div>
          <label class="label-text">Duration (days)</label>
          <input v-model.number="form.duration" type="number" min="1" required class="input-field mt-1.5" />
        </div>
        <div>
          <label class="label-text">Features (one per line)</label>
          <textarea v-model="form.features" rows="3" class="input-field mt-1.5" placeholder="Feature 1&#10;Feature 2&#10;Feature 3"></textarea>
        </div>

        <p v-if="formError" class="text-sm text-danger-600 bg-danger-50 rounded-lg px-3 py-2">
          {{ formError }}
        </p>
      </form>

      <template #footer>
        <button @click="showModal = false" class="btn-secondary">Cancel</button>
        <button @click="handleSave" :disabled="isSaving" class="btn-primary">
          <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
          {{ editingPlan ? 'Update' : 'Create' }}
        </button>
      </template>
    </BaseModal>

    <!-- Delete Confirmation -->
    <BaseModal
      :show="showDeleteModal"
      title="Delete Plan"
      size="sm"
      @close="showDeleteModal = false"
    >
      <p class="text-sm text-slate-600">
        Are you sure you want to delete the <strong>{{ deletingPlan?.name }}</strong> plan? Organizations using this plan may be affected.
      </p>
      <template #footer>
        <button @click="showDeleteModal = false" class="btn-secondary">Cancel</button>
        <button @click="confirmDelete" :disabled="isDeleting" class="btn-danger">
          <Loader2 v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
          Delete
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useSuperAdminStore } from '@/stores/superAdmin'
import { formatCurrency } from '@/utils/helpers'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-vue-next'

const superAdminStore = useSuperAdminStore()

const columns = [
  { key: 'name', label: 'Plan Name' },
  { key: 'price', label: 'Price' },
  { key: 'maxUsers', label: 'Max Users' },
  { key: 'duration', label: 'Duration' },
  { key: 'actions', label: 'Actions' },
]

const showModal = ref(false)
const showDeleteModal = ref(false)
const editingPlan = ref(null)
const deletingPlan = ref(null)
const isSaving = ref(false)
const isDeleting = ref(false)
const formError = ref('')

const form = ref({
  name: '',
  price: 0,
  maxUsers: 10,
  duration: 30,
  features: '',
})

function openModal(plan = null) {
  editingPlan.value = plan
  formError.value = ''
  if (plan) {
    form.value = {
      name: plan.name || '',
      price: plan.price || 0,
      maxUsers: plan.maxUsers || plan.max_users || 10,
      duration: plan.duration || 30,
      features: Array.isArray(plan.features) ? plan.features.join('\n') : (plan.features || ''),
    }
  } else {
    form.value = { name: '', price: 0, maxUsers: 10, duration: 30, features: '' }
  }
  showModal.value = true
}

async function handleSave() {
  formError.value = ''
  isSaving.value = true

  const payload = {
    ...form.value,
    features: form.value.features.split('\n').map((f) => f.trim()).filter(Boolean),
  }

  try {
    if (editingPlan.value) {
      await superAdminStore.updatePlan(editingPlan.value.id, payload)
    } else {
      await superAdminStore.createPlan(payload)
    }
    showModal.value = false
    superAdminStore.fetchPlans()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Operation failed.'
  } finally {
    isSaving.value = false
  }
}

function handleDelete(plan) {
  deletingPlan.value = plan
  showDeleteModal.value = true
}

async function confirmDelete() {
  isDeleting.value = true
  try {
    await superAdminStore.deletePlan(deletingPlan.value.id)
    showDeleteModal.value = false
    superAdminStore.fetchPlans()
  } catch {
    // Error handled by store
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  superAdminStore.fetchPlans()
})
</script>
