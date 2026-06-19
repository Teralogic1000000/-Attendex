<template>
  <div>
    <AppHeader :title="greeting" :subtitle="'Here\'s your attendance overview for today'" />

    <div class="p-6 flex flex-col gap-6">
      <!-- Validation Error Alert -->
      <div
        v-if="validationError"
        class="bg-red-50 border border-red-200 rounded-lg p-4"
      >
        <div class="flex items-start gap-3">
          <AlertCircle class="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p class="text-sm font-medium text-red-900">{{ validationError.message }}</p>
            <p v-if="validationError.details?.distance" class="text-xs text-red-700 mt-1">
              Distance: {{ Math.round(validationError.details.distance) }}m outside allowed zone
            </p>
            <button
              @click="clearValidationError"
              class="text-xs text-red-600 hover:text-red-700 mt-2 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>

      <!-- Permission Request Alert -->
      <div
        v-if="showLocationPermissionRequest"
        class="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <div class="flex items-start gap-3">
          <MapPin class="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div class="flex-1">
            <p class="text-sm font-medium text-blue-900">Location Access Needed</p>
            <p class="text-xs text-blue-700 mt-1">
              To verify your location during check-in, this app needs access to your GPS. Your location is only
              used for attendance verification and is not stored for tracking purposes.
            </p>
            <div class="flex gap-2 mt-3">
              <button
                @click="requestLocationPermission"
                class="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enable Location
              </button>
              <button
                @click="dismissLocationRequest"
                class="text-xs px-3 py-1 bg-white text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
              >
                Ask Later
              </button>
            </div>
          </div>
        </div>
      </div>

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
            :disabled="isCheckedOut || isLoading"
            :class="isLoading ? 'opacity-50 cursor-not-allowed' : ''"
            class="btn-accent px-8 py-3 text-base"
          >
            <LogIn class="mr-2 h-5 w-5" />
            {{ isLoading ? 'Processing...' : 'Check In' }}
          </button>
          <button
            v-else
            @click="handleCheckOut"
            :disabled="isLoading"
            :class="isLoading ? 'opacity-50 cursor-not-allowed' : ''"
            class="btn-danger px-8 py-3 text-base"
          >
            <LogOut class="mr-2 h-5 w-5" />
            {{ isLoading ? 'Processing...' : 'Check Out' }}
          </button>

          <p v-if="isCheckedOut" class="mt-4 text-sm text-slate-500">
            You have completed your attendance for today.
          </p>

          <!-- Device Status -->
          <div class="mt-6 pt-6 border-t border-slate-200">
            <p class="text-xs text-slate-500 mb-2">Device Status</p>
            <div class="flex items-center justify-center gap-2 text-sm">
              <div
                :class="deviceTrusted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                class="rounded-full w-2 h-2"
              />
              <span :class="deviceTrusted ? 'text-green-700' : 'text-yellow-700'">
                {{ deviceTrusted ? 'Device Verified' : 'Device Unverified' }}
              </span>
            </div>
          </div>
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
import { useLoadingStore } from '@/stores/loading'
import { getGreeting, formatTime, calculateHours } from '@/utils/helpers'
import { Clock, LogIn, LogOut, CalendarCheck, Timer, Flame, AlertCircle, MapPin } from 'lucide-vue-next'
import { isDeviceTrusted } from '@/utils/deviceUtils'

const authStore = useAuthStore()
const attendanceStore = useAttendanceStore()
const loadingStore = useLoadingStore()

const greeting = computed(() => `${getGreeting()}, ${authStore.user?.firstName || 'there'}`)

const todayRecord = computed(() => attendanceStore.todayRecord)
const isCheckedIn = computed(() => attendanceStore.currentStatus === 'checked_in')
const isCheckedOut = computed(() => attendanceStore.currentStatus === 'checked_out')
const isLoading = computed(() => loadingStore.isLoading)
const deviceTrusted = computed(() => isDeviceTrusted())

const hoursWorked = computed(() => {
  if (!todayRecord.value) return '0.0'
  const checkIn = todayRecord.value.checkIn || todayRecord.value.check_in
  const checkOut = todayRecord.value.checkOut || todayRecord.value.check_out || new Date().toISOString()
  return calculateHours(checkIn, checkOut)
})

const validationError = ref(null)
const showLocationPermissionRequest = ref(false)

const stats = ref({
  daysPresent: 0,
  avgHours: '0.0',
  streak: 0,
})

async function handleCheckIn() {
  validationError.value = null
  try {
    await attendanceStore.checkIn()
  } catch (error) {
    // Validation error details are stored in attendanceStore.lastValidationError
    validationError.value = attendanceStore.getValidationErrorDetails()
  }
}

async function handleCheckOut() {
  validationError.value = null
  try {
    await attendanceStore.checkOut()
  } catch (error) {
    // Validation error details are stored in attendanceStore.lastValidationError
    validationError.value = attendanceStore.getValidationErrorDetails()
  }
}

function clearValidationError() {
  validationError.value = null
  attendanceStore.clearValidationError()
}

function requestLocationPermission() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      () => {
        showLocationPermissionRequest.value = false
      },
      () => {
        // Permission denied, but don't show error, just hide the request
        showLocationPermissionRequest.value = false
      }
    )
  }
}

function dismissLocationRequest() {
  showLocationPermissionRequest.value = false
  // Remember user dismissed this for the session
  sessionStorage.setItem('locationRequestDismissed', 'true')
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

    // Show location permission request if not dismissed
    if (!sessionStorage.getItem('locationRequestDismissed')) {
      showLocationPermissionRequest.value = true
    }
  } catch {
    // Error handled by store
  }
})
</script>