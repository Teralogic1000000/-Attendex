<template>
  <div>
    <AppHeader title="Organization Directory" subtitle="Manage all registered organizations" />

    <div class="p-6">
      <BaseTable :columns="columns" :rows="superAdminStore.organizations">
        <template #header>
          <div class="relative flex-1 max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Search organizations..."
              class="input-field pl-9"
            />
          </div>
        </template>

        <template #cell-name="{ row }">
          <div>
            <p class="font-medium text-slate-900">{{ row.name }}</p>
            <p class="text-xs text-slate-500">{{ row.email || '' }}</p>
          </div>
        </template>

        <template #cell-admin="{ row }">
          <p class="text-sm text-slate-700">
            {{ row.adminName || row.admin_name || '-' }}
          </p>
        </template>

        <template #cell-users="{ row }">
          <span class="font-medium text-slate-900">{{ row.userCount || row.user_count || 0 }}</span>
        </template>

        <template #cell-plan="{ row }">
          <span class="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
            {{ row.planName || row.plan_name || 'Free' }}
          </span>
        </template>

        <template #cell-status="{ row }">
          <span
            :class="row.isActive !== false && row.status !== 'suspended'
              ? 'bg-accent-50 text-accent-700'
              : 'bg-danger-50 text-danger-700'"
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          >
            {{ row.isActive !== false && row.status !== 'suspended' ? 'Active' : 'Suspended' }}
          </span>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2">
            <button
              @click="viewDetails(row)"
              class="rounded-lg p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              title="View Details"
            >
              <Eye class="h-4 w-4" />
              <span class="sr-only">View details</span>
            </button>
            <button
              v-if="row.isActive !== false && row.status !== 'suspended'"
              @click="handleStatusChange(row, 'suspended')"
              class="rounded-lg p-1.5 text-slate-400 hover:text-warning-600 hover:bg-warning-50 transition-colors"
              title="Suspend"
            >
              <Ban class="h-4 w-4" />
              <span class="sr-only">Suspend organization</span>
            </button>
            <button
              v-else
              @click="handleStatusChange(row, 'active')"
              class="rounded-lg p-1.5 text-slate-400 hover:text-accent-600 hover:bg-accent-50 transition-colors"
              title="Activate"
            >
              <CheckCircle class="h-4 w-4" />
              <span class="sr-only">Activate organization</span>
            </button>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- Details Modal -->
    <BaseModal
      :show="showDetailsModal"
      :title="selectedOrg?.name || 'Organization Details'"
      size="lg"
      @close="showDetailsModal = false"
    >
      <div v-if="selectedOrg" class="flex flex-col gap-6">
        <!-- Basic Info -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-slate-500">Organization Name</p>
            <p class="font-medium text-slate-900">{{ selectedOrg.name }}</p>
          </div>
          <div>
            <p class="text-slate-500">Admin</p>
            <p class="font-medium text-slate-900">{{ selectedOrg.adminName || selectedOrg.admin_name || '-' }}</p>
          </div>
          <div>
            <p class="text-slate-500">Users</p>
            <p class="font-medium text-slate-900">{{ selectedOrg.userCount || selectedOrg.user_count || 0 }}</p>
          </div>
          <div>
            <p class="text-slate-500">Plan</p>
            <p class="font-medium text-slate-900">{{ selectedOrg.planName || selectedOrg.plan_name || 'Free' }}</p>
          </div>
          <div>
            <p class="text-slate-500">Status</p>
            <p class="font-medium text-slate-900">{{ selectedOrg.isActive !== false ? 'Active' : 'Suspended' }}</p>
          </div>
          <div>
            <p class="text-slate-500">Created</p>
            <p class="font-medium text-slate-900">{{ formatDate(selectedOrg.createdAt || selectedOrg.created_at) }}</p>
          </div>
        </div>

        <!-- Branding Info -->
        <div class="border-t pt-4">
          <h4 class="font-semibold text-slate-700 mb-3">Branding & Customization</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-slate-500">Logo</p>
              <p v-if="selectedOrg.logoUrl" class="mt-2">
                <img :src="selectedOrg.logoUrl" alt="Logo" class="h-10 object-contain" />
              </p>
              <p v-else class="text-slate-400 text-xs">No logo set</p>
            </div>
            <div>
              <p class="text-slate-500">Primary Theme Color</p>
              <div v-if="selectedOrg.theme?.primary" class="flex items-center gap-2 mt-2">
                <div
                  class="w-8 h-8 rounded border border-slate-200"
                  :style="{ backgroundColor: selectedOrg.theme.primary }"
                ></div>
                <p class="font-medium text-slate-900">{{ selectedOrg.theme.primary }}</p>
              </div>
              <p v-else class="text-slate-400 text-xs">#ff6600 (default)</p>
            </div>
            <div v-if="selectedOrg.theme?.secondary">
              <p class="text-slate-500">Secondary Color</p>
              <div class="flex items-center gap-2 mt-2">
                <div
                  class="w-8 h-8 rounded border border-slate-200"
                  :style="{ backgroundColor: selectedOrg.theme.secondary }"
                ></div>
                <p class="font-medium text-slate-900">{{ selectedOrg.theme.secondary }}</p>
              </div>
            </div>
            <div v-if="selectedOrg.theme">
              <p class="text-slate-500">Dark Mode</p>
              <p class="font-medium text-slate-900 mt-2">{{ selectedOrg.theme.darkMode ? 'Enabled' : 'Disabled' }}</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="showDetailsModal = false" class="btn-secondary">Close</button>
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
import { formatDate } from '@/utils/helpers'
import { Search, Eye, Ban, CheckCircle } from 'lucide-vue-next'

const superAdminStore = useSuperAdminStore()

const columns = [
  { key: 'name', label: 'Organization' },
  { key: 'admin', label: 'Admin' },
  { key: 'users', label: 'Users' },
  { key: 'plan', label: 'Plan' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

const searchQuery = ref('')
const showDetailsModal = ref(false)
const selectedOrg = ref(null)

function viewDetails(org) {
  selectedOrg.value = org
  showDetailsModal.value = true
}

async function handleStatusChange(org, status) {
  try {
    await superAdminStore.updateOrgStatus(org.id, status)
  } catch {
    // Error handled by store
  }
}

let searchTimeout = null
function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    superAdminStore.fetchOrganizations({ search: searchQuery.value })
  }, 300)
}

onMounted(() => {
  superAdminStore.fetchOrganizations()
})
</script>
