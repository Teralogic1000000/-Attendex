<template>
  <div>
    <AppHeader :title="greeting" :subtitle="'Here\'s your attendance overview for today'" />

    <div class="p-6 flex flex-col gap-6">
      <!-- Check In/Out Card -->
      <div class="card p-8 text-center">
        <div class="mx-auto max-w-md">
          <div class="mb-4">
            <div
              :class="isCheckedIn ? 'bg-accent-100 text-accent-700' : 'bg-slate-100 text-slate-500'"
              class="mx-auto flex h-20 w-20 items-center justify-center rounded-full transition-colors"
            >
              <Clock class="h-10 w-10" />
            </div>
          </div>
          <p class="text-sm font-medium text-slate-500 mb-1">Current Status</p>
          <p class="text-2xl font-bold text-slate-900 mb-6">
            {{ isCheckedIn ? 'Checked In' : 'Not Checked In' }}
          </p>

          <div v-if="todayRecord" class="flex items-center justify-center gap-8 mb-6 text-sm">
            <div>
              <p class="text-slate-500">Check-in</p>
              <p class="font-semibold text-slate-900">{{ formatTime(todayRecord.checkIn || todayRecord.check_in) }}</p>
            </div>
            <div v-if="todayRecord.checkOut || todayRecord.check_out">
              <p class="text-slate-500">Check-out</p>
              <p class="font-semibold text-slate-900">{{ formatTime(todayRecord.checkOut || todayRecord.check_out) }}</p>
            </div>
            <div v-if="todayRecord.checkIn || todayRecord.check_in">
              <p class="text-slate-500">Hours</p>
              <p class="font-semibold text-slate-900">{{ hoursWorked }}</p>
            </div>
          </div>

          <button
            v-if="!isCheckedIn"
            @click="handleCheckIn"
            :disabled="isCheckedOut"
            class="btn-accent px-8 py-3 text-base"
          >
            <LogIn class="mr-2 h-5 w-5" />
            Check In
          </button>
          <button
            v-else
            @click="handleCheckOut"
            class="btn-danger px-8 py-3 text-base"
          >
            <LogOut class="mr-2 h-5 w-5" />
            Check Out
          </button>

          <p v-if="isCheckedOut" class="mt-4 text-sm text-slate-500">
            You have completed your attendance for today.
          </p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="This Month"
          :value="stats.daysPresent + ' days'"
          subtitle="Days present"
          :icon="CalendarCheck"
          color="primary"
        />
        <StatCard
          title="Average Hours"
          :value="stats.avgHours + 'h'"
          subtitle="Per working day"
          :icon="Timer"
          color="accent"
        />
        <StatCard
          title="Current Streak"
          :value="stats.streak + ' days'"
          subtitle="Consecutive attendance"
          :icon="Flame"
          color="warning"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useAttendanceStore } from '@/stores/attendance'
import { getGreeting, formatTime, calculateHours } from '@/utils/helpers'
import { Clock, LogIn, LogOut, CalendarCheck, Timer, Flame } from 'lucide-vue-next'

const authStore = useAuthStore()
const attendanceStore = useAttendanceStore()

const greeting = computed(() => `${getGreeting()}, ${authStore.user?.firstName || 'there'}`)

const todayRecord = computed(() => attendanceStore.todayRecord)
const isCheckedIn = computed(() => attendanceStore.currentStatus === 'checked_in')
const isCheckedOut = computed(() => attendanceStore.currentStatus === 'checked_out')

const hoursWorked = computed(() => {
  if (!todayRecord.value) return '0.0'
  const checkIn = todayRecord.value.checkIn || todayRecord.value.check_in
  const checkOut = todayRecord.value.checkOut || todayRecord.value.check_out || new Date().toISOString()
  return calculateHours(checkIn, checkOut)
})

const stats = ref({
  daysPresent: 0,
  avgHours: '0.0',
  streak: 0,
})

async function handleCheckIn() {
  try {
    await attendanceStore.checkIn()
  } catch {
    // Error handled by store
  }
}

async function handleCheckOut() {
  try {
    await attendanceStore.checkOut()
  } catch {
    // Error handled by store
  }
}

onMounted(async () => {
  try {
    const data = await attendanceStore.fetchMyAttendance()
    if (data?.stats) {
      stats.value = {
        daysPresent: data.stats.daysPresent || 0,
        avgHours: data.stats.avgHours || '0.0',
        streak: data.stats.streak || 0,
      }
    }
  } catch {
    // Error handled by store
  }
})
</script>
