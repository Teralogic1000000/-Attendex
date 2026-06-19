<template>
  <div>
    <AppHeader title="Attendance Records" subtitle="View attendance records across your organization" />

    <div class="p-6">
      <!-- Filters -->
      <div class="card p-4 mb-6">
        <div class="flex flex-wrap items-end gap-4">
          <div>
            <label class="label-text">From</label>
            <input v-model="filters.startDate" type="date" class="input-field mt-1" />
          </div>
          <div>
            <label class="label-text">To</label>
            <input v-model="filters.endDate" type="date" class="input-field mt-1" />
          </div>
          <div class="flex-1 min-w-48">
            <label class="label-text">Search Employee</label>
            <input v-model="filters.search" type="text" placeholder="Search by name..." class="input-field mt-1" />
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
      <BaseTable :columns="columns" :rows="attendanceStore.orgAttendance">
        <template #cell-employee="{ row }">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
              {{ getInitials(row.firstName || row.first_name || row.user_name, row.lastName || row.last_name || '') }}
            </div>
            <p class="font-medium text-slate-900">
              {{ row.firstName || row.first_name || row.user_name || 'N/A' }}
              {{ row.lastName || row.last_name || '' }}
            </p>
          </div>
        </template>
        <template #cell-date="{ row }">
          {{ formatDate(row.date || row.check_in || row.checkIn) }}
        </template>
        <template #cell-checkIn="{ row }">
          <span class="text-accent-700">{{ formatTime(row.checkIn || row.check_in) }}</span>
        </template>
        <template #cell-checkOut="{ row }">
          <span v-if="row.checkOut || row.check_out" class="text-danger-600">
            {{ formatTime(row.checkOut || row.check_out) }}
          </span>
          <span v-else class="text-slate-400">--</span>
        </template>
        <template #cell-hours="{ row }">
          {{ calculateHours(row.checkIn || row.check_in, row.checkOut || row.check_out) }}h
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import { useAttendanceStore } from '@/stores/attendance'
import { formatDate, formatTime, calculateHours, getInitials } from '@/utils/helpers'
import { Search } from 'lucide-vue-next'

const attendanceStore = useAttendanceStore()

const columns = [
  { key: 'employee', label: 'Employee' },
  { key: 'date', label: 'Date' },
  { key: 'checkIn', label: 'Check In' },
  { key: 'checkOut', label: 'Check Out' },
  { key: 'hours', label: 'Hours' },
]

const filters = ref({
  startDate: '',
  endDate: '',
  search: '',
})

async function applyFilters() {
  try {
    await attendanceStore.fetchOrgAttendance(filters.value)
  } catch {
    // Error handled by store
  }
}

function resetFilters() {
  filters.value = { startDate: '', endDate: '', search: '' }
  applyFilters()
}

onMounted(() => {
  applyFilters()
})
</script>
