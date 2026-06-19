<template>
  <div>
    <AppHeader title="User Management" subtitle="Add, edit, and manage employees in your organization" />

    <div class="p-6">
      <BaseTable :columns="columns" :rows="userStore.users">
        <template #header>
          <div class="flex items-center gap-3 flex-1">
            <div class="relative flex-1 max-w-sm">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                placeholder="Search users..."
                class="input-field pl-9"
              />
            </div>
          </div>
          <button @click="openModal()" class="btn-primary">
            <Plus class="mr-1.5 h-4 w-4" />
            Add Employee
          </button>
        </template>

        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
              {{ getInitials(row.firstName || row.first_name, row.lastName || row.last_name) }}
            </div>
            <div>
              <p class="font-medium text-slate-900">{{ row.firstName || row.first_name }} {{ row.lastName || row.last_name }}</p>
              <p class="text-xs text-slate-500">{{ row.email }}</p>
            </div>
          </div>
        </template>

        <template #cell-role="{ row }">
          <span
            :class="row.role === 'OrgAdmin' ? 'bg-primary-50 text-primary-700' : 'bg-slate-100 text-slate-700'"
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          >
            {{ row.role || row.role_name || 'Employee' }}
          </span>
        </template>

        <template #cell-status="{ row }">
          <span
            :class="row.isActive !== false ? 'bg-accent-50 text-accent-700' : 'bg-slate-100 text-slate-500'"
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          >
            {{ row.isActive !== false ? 'Active' : 'Inactive' }}
          </span>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2">
            <button @click="openModal(row)" class="rounded-lg p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Edit">
              <Pencil class="h-4 w-4" />
              <span class="sr-only">Edit user</span>
            </button>
            <button @click="handleDelete(row)" class="rounded-lg p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-colors" title="Delete">
              <Trash2 class="h-4 w-4" />
              <span class="sr-only">Delete user</span>
            </button>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- User Form Modal -->
    <BaseModal
      :show="showModal"
      :title="editingUser ? 'Edit Employee' : 'Add Employee'"
      @close="showModal = false"
    >
      <form @submit.prevent="handleSave" class="flex flex-col gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label-text">First Name</label>
            <input v-model="form.firstName" type="text" required class="input-field mt-1.5" />
          </div>
          <div>
            <label class="label-text">Last Name</label>
            <input v-model="form.lastName" type="text" required class="input-field mt-1.5" />
          </div>
        </div>
        <div>
          <label class="label-text">Email</label>
          <input v-model="form.email" type="email" required :disabled="!!editingUser" class="input-field mt-1.5" :class="editingUser ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''" />
        </div>
        <div v-if="!editingUser">
          <label class="label-text">Password</label>
          <input v-model="form.password" type="password" required minlength="8" placeholder="Min. 8 characters" autocomplete="new-password" class="input-field mt-1.5" />
        </div>

        <p v-if="formError" class="text-sm text-danger-600 bg-danger-50 rounded-lg px-3 py-2">
          {{ formError }}
        </p>
      </form>

      <template #footer>
        <button @click="showModal = false" class="btn-secondary">Cancel</button>
        <button @click="handleSave" :disabled="isSaving" class="btn-primary">
          <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
          {{ editingUser ? 'Update' : 'Create' }}
        </button>
      </template>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal
      :show="showDeleteModal"
      title="Delete Employee"
      size="sm"
      @close="showDeleteModal = false"
    >
      <p class="text-sm text-slate-600">
        Are you sure you want to delete <strong>{{ deletingUser?.firstName || deletingUser?.first_name }} {{ deletingUser?.lastName || deletingUser?.last_name }}</strong>? This action cannot be undone.
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
import { useUserStore } from '@/stores/user'
import { getInitials } from '@/utils/helpers'
import { Search, Plus, Pencil, Trash2, Loader2 } from 'lucide-vue-next'

const userStore = useUserStore()

const columns = [
  { key: 'name', label: 'Employee' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

const searchQuery = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref(null)
const deletingUser = ref(null)
const isSaving = ref(false)
const isDeleting = ref(false)
const formError = ref('')

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
})

function openModal(user = null) {
  editingUser.value = user
  formError.value = ''
  if (user) {
    form.value = {
      firstName: user.firstName || user.first_name || '',
      lastName: user.lastName || user.last_name || '',
      email: user.email || '',
      password: '',
    }
  } else {
    form.value = { firstName: '', lastName: '', email: '', password: '' }
  }
  showModal.value = true
}

async function handleSave() {
  formError.value = ''
  isSaving.value = true

  try {
    if (editingUser.value) {
      await userStore.updateUser(editingUser.value.id, {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
      })
    } else {
      await userStore.createUser(form.value)
    }
    showModal.value = false
  } catch (err) {
    formError.value = err.response?.data?.message || 'Operation failed.'
  } finally {
    isSaving.value = false
  }
}

function handleDelete(user) {
  deletingUser.value = user
  showDeleteModal.value = true
}

async function confirmDelete() {
  isDeleting.value = true
  try {
    await userStore.deleteUser(deletingUser.value.id)
    showDeleteModal.value = false
  } catch {
    // Error handled by store
  } finally {
    isDeleting.value = false
  }
}

let searchTimeout = null
function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    userStore.fetchUsers({ search: searchQuery.value })
  }, 300)
}

onMounted(() => {
  userStore.fetchUsers()
})
</script>
