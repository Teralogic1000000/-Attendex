<template>
  <div>
    <AppHeader title="System Logs" subtitle="View platform audit logs and system events" />

    <div class="p-6">
      <!-- Filters -->
      <div class="card p-4 mb-6">
        <div class="flex flex-wrap items-end gap-4">
          <div>
            <label class="label-text">Level</label>
            <select v-model="filters.level" class="input-field mt-1">
              <option value="">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label class="label-text">From</label>
            <input v-model="filters.startDate" type="date" class="input-field mt-1" />
          </div>
          <div>
            <label class="label-text">To</label>
            <input v-model="filters.endDate" type="date" class="input-field mt-1" />
          </div>
          <div class="flex-1 min-w-48">
            <label class="label-text">Search</label>
            <input v-model="filters.search" type="text" placeholder="Search logs..." class="input-field mt-1" />
          </div>
          <button @click="applyFilters" class="btn-primary">
            <Search class="mr-1.5 h-4 w-4" />
            Filter
          </button>
          <button @click="resetFilters" class="btn-secondary">
            Reset
          </button>
        </div>
      </div>

      <!-- Table -->
      <BaseTable :columns="columns" :rows="superAdminStore.logs">
        <template #cell-timestamp="{ row }">
          <p class="text-sm text-slate-700">{{ formatDateTime(row.timestamp || row.created_at || row.createdAt) }}</p>
        </template>

        <template #cell-level="{ row }">
          <span
            :class="levelClass(row.level)"
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          >
            {{ (row.level || 'info').toUpperCase() }}
          </span>
        </template>

        <template #cell-action="{ row }">
          <p class="font-medium text-slate-900">{{ row.action || row.message || '-' }}</p>
        </template>

        <template #cell-user="{ row }">
          <p class="text-sm text-slate-700">{{ row.userName || row.user_name || row.email || '-' }}</p>
        </template>

        <template #cell-details="{ row }">
          <p class="text-sm text-slate-500 max-w-xs truncate" :title="row.details || row.description || ''">
            {{ row.details || row.description || '-' }}
          </p>
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import { useSuperAdminStore } from '@/stores/superAdmin'
import { formatDateTime } from '@/utils/helpers'
import { Search } from 'lucide-vue-next'

const superAdminStore = useSuperAdminStore()

const columns = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'level', label: 'Level' },
  { key: 'action', label: 'Action' },
  { key: 'user', label: 'User' },
  { key: 'details', label: 'Details' },
]

const filters = ref({
  level: '',
  startDate: '',
  endDate: '',
  search: '',
})

function levelClass(level) {
  const classes = {
    info: 'bg-primary-50 text-primary-700',
    warning: 'bg-warning-50 text-warning-700',
    error: 'bg-danger-50 text-danger-700',
    critical: 'bg-danger-100 text-danger-800',
  }
  return classes[level] || classes.info
}

async function applyFilters() {
  const params = {}
  if (filters.value.level) params.level = filters.value.level
  if (filters.value.startDate) params.startDate = filters.value.startDate
  if (filters.value.endDate) params.endDate = filters.value.endDate
  if (filters.value.search) params.search = filters.value.search

  try {
    await superAdminStore.fetchLogs(params)
  } catch {
    // Error handled by store
  }
}

function resetFilters() {
  filters.value = { level: '', startDate: '', endDate: '', search: '' }
  applyFilters()
}

onMounted(() => {
  applyFilters()
})
</script>
