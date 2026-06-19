<template>
  <div>
    <AppHeader title="Attendance History" subtitle="View your check-in and check-out records" />

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
      <BaseTable :columns="columns" :rows="attendanceStore.myAttendance">
        <template #cell-date="{ row }">
          {{ formatDate(row.date || row.check_in || row.checkIn) }}
        </template>
        <template #cell-checkIn="{ row }">
          <span class="inline-flex items-center gap-1.5 text-accent-700">
            <ArrowDownCircle class="h-3.5 w-3.5" />
            {{ formatTime(row.checkIn || row.check_in) }}
          </span>
        </template>
        <template #cell-checkOut="{ row }">
          <span v-if="row.checkOut || row.check_out" class="inline-flex items-center gap-1.5 text-danger-600">
            <ArrowUpCircle class="h-3.5 w-3.5" />
            {{ formatTime(row.checkOut || row.check_out) }}
          </span>
          <span v-else class="text-sm text-slate-400">--</span>
        </template>
        <template #cell-hours="{ row }">
          {{ calculateHours(row.checkIn || row.check_in, row.checkOut || row.check_out) }}h
        </template>
        <template #cell-status="{ row }">
          <span
            :class="getStatusClass(row)"
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          >
            {{ getStatusLabel(row) }}
          </span>
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
import { formatDate, formatTime, calculateHours } from '@/utils/helpers'
import { Search, ArrowDownCircle, ArrowUpCircle } from 'lucide-vue-next'

const attendanceStore = useAttendanceStore()

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'checkIn', label: 'Check In' },
  { key: 'checkOut', label: 'Check Out' },
  { key: 'hours', label: 'Hours Worked' },
  { key: 'status', label: 'Status' },
]

const filters = ref({
  startDate: '',
  endDate: '',
})

function getStatusClass(row) {
  const hasCheckOut = row.checkOut || row.check_out
  const hasCheckIn = row.checkIn || row.check_in
  if (hasCheckIn && hasCheckOut) return 'bg-accent-50 text-accent-700'
  if (hasCheckIn && !hasCheckOut) return 'bg-warning-50 text-warning-700'
  return 'bg-slate-100 text-slate-600'
}

function getStatusLabel(row) {
  const hasCheckOut = row.checkOut || row.check_out
  const hasCheckIn = row.checkIn || row.check_in
  if (hasCheckIn && hasCheckOut) return 'Complete'
  if (hasCheckIn && !hasCheckOut) return 'In Progress'
  return 'Absent'
}

async function applyFilters() {
  try {
    await attendanceStore.fetchMyAttendance(filters.value)
  } catch {
    // Error handled by store
  }
}

function resetFilters() {
  filters.value = { startDate: '', endDate: '' }
  applyFilters()
}

onMounted(() => {
  applyFilters()
})
</script>
