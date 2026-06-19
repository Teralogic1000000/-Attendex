<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Device Management</h1>
      <p class="text-slate-600 mt-1">Register and manage devices for attendance check-in</p>
    </div>

    <!-- Register New Device Section -->
    <div class="card p-6 mb-6">
      <h2 class="text-lg font-semibold text-slate-900 mb-4">Register Device</h2>
      
      <div v-if="registrationStatus" :class="registrationStatusClass" class="p-4 rounded-lg mb-4">
        <p class="text-sm font-medium">{{ registrationStatus }}</p>
        <button
          @click="registrationStatus = ''"
          class="text-xs mt-2 underline hover:no-underline"
        >
          Dismiss
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Current Device Info (Read-only) -->
        <div class="space-y-4">
          <h3 class="font-medium text-slate-900">Current Device</h3>
          
          <div class="bg-slate-50 rounded-lg p-4 space-y-3">
            <div>
              <p class="text-xs font-medium text-slate-500 uppercase">Device ID</p>
              <p class="text-sm font-mono text-slate-900 break-all">{{ deviceId }}</p>
              <button
                @click="copyToClipboard(deviceId)"
                class="text-xs text-blue-600 hover:text-blue-700 mt-1"
              >
                Copy
              </button>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-500 uppercase">Type</p>
              <p class="text-sm text-slate-900">{{ coreDeviceData.deviceType }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-500 uppercase">Model</p>
              <p class="text-sm text-slate-900">{{ coreDeviceData.deviceModel }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-500 uppercase">OS Version</p>
              <p class="text-sm text-slate-900">{{ coreDeviceData.osVersion }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-500 uppercase">App Version</p>
              <p class="text-sm text-slate-900">{{ appVersion }}</p>
            </div>
          </div>
        </div>

        <!-- Registration Action -->
        <div class="space-y-4">
          <h3 class="font-medium text-slate-900">Actions</h3>
          
          <button
            @click="handleRegisterDevice"
            :disabled="isRegistering || isDeviceRegistered"
            class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isRegistering ? 'Registering...' : (isDeviceRegistered ? 'Device Registered' : 'Register This Device') }}
          </button>

          <div v-if="isDeviceRegistered" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 class="h-5 w-5" />
              <span class="font-medium">Device is registered and trusted</span>
            </div>
            <p class="text-xs text-green-600 mt-2">
              You can use this device for attendance check-in and check-out.
            </p>
          </div>

          <p class="text-xs text-slate-500 mt-4">
            First device registered is automatically trusted. Additional devices require verification.
          </p>
        </div>
      </div>
    </div>

    <!-- Registered Devices List -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold text-slate-900 mb-4">Your Devices</h2>

      <div v-if="devices.length === 0" class="text-center py-8">
        <Smartphone class="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <p class="text-slate-600">No devices registered yet</p>
        <p class="text-sm text-slate-500 mt-1">Register your device above to get started</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="device in devices"
          :key="device.id"
          class="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
        >
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <p class="font-medium text-slate-900">{{ device.deviceType }} {{ device.deviceModel }}</p>
              <span
                v-if="device.isTrusted"
                class="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
              >
                <CheckCircle2 class="h-3 w-3" />
                Trusted
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded"
              >
                <AlertCircle class="h-3 w-3" />
                Pending Verification
              </span>
            </div>
            <p class="text-xs text-slate-500">{{ device.osVersion }} • {{ formatDate(device.createdAt) }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="!device.isTrusted && device.id !== currentDeviceId"
              @click="handleTrustDevice(device.id)"
              class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Verify
            </button>
            <button
              @click="handleDeleteDevice(device.id)"
              class="px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Information Box -->
    <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex gap-3">
        <Info class="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div class="text-sm text-blue-900">
          <p class="font-medium mb-1">About Device Registration</p>
          <ul class="text-xs space-y-1 text-blue-800">
            <li>• Your first registered device is automatically trusted</li>
            <li>• Additional devices must be verified before use</li>
            <li>• Only trusted devices can be used for attendance check-in</li>
            <li>• Device information helps us ensure attendance security</li>
            <li>• You can manage or remove devices anytime</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import deviceService from '@/services/deviceService'
import { useNotificationStore } from '@/stores/notification'
import { useLoadingStore } from '@/stores/loading'
import {
  getDeviceId,
  getCoreDeviceData,
  getAppVersion,
  getDeviceInfo,
  isDeviceTrusted,
} from '@/utils/deviceUtils'
import { CheckCircle2, AlertCircle, Smartphone, Info } from 'lucide-vue-next'

const notify = useNotificationStore()
const loading = useLoadingStore()

const deviceId = computed(() => getDeviceId())
const coreDeviceData = computed(() => getCoreDeviceData())
const appVersion = computed(() => getAppVersion())

const isRegistering = ref(false)
const isDeviceRegistered = computed(() => isDeviceTrusted() && getDeviceInfo() !== null)
const currentDeviceId = computed(() => getDeviceId())

const devices = ref([])
const registrationStatus = ref('')
const registrationStatusClass = ref('')

async function handleRegisterDevice() {
  registrationStatus.value = ''
  isRegistering.value = true
  try {
    const response = await deviceService.registerDevice()
    if (response.isTrusted) {
      registrationStatus.value = '✓ Device registered and trusted successfully'
      registrationStatusClass.value = 'bg-green-50 border border-green-200 text-green-700'
    } else {
      registrationStatus.value = 'Device registered. Please verify it from another device.'
      registrationStatusClass.value = 'bg-yellow-50 border border-yellow-200 text-yellow-700'
    }
    await fetchMyDevices()
    notify.success('Device registered successfully')
  } catch (error) {
    registrationStatus.value = `Error: ${error.response?.data?.message || error.message}`
    registrationStatusClass.value = 'bg-red-50 border border-red-200 text-red-700'
    notify.error('Failed to register device')
  } finally {
    isRegistering.value = false
  }
}

async function handleTrustDevice(deviceId) {
  try {
    await deviceService.trustDevice(deviceId)
    notify.success('Device verified successfully')
    await fetchMyDevices()
  } catch (error) {
    notify.error('Failed to verify device')
  }
}

async function handleDeleteDevice(deviceId) {
  if (!confirm('Are you sure you want to remove this device?')) {
    return
  }
  try {
    await deviceService.deleteDevice(deviceId)
    notify.success('Device removed successfully')
    await fetchMyDevices()
  } catch (error) {
    notify.error('Failed to delete device')
  }
}

async function fetchMyDevices() {
  try {
    const response = await deviceService.getMyDevices()
    devices.value = response.devices || response || []
  } catch (error) {
    console.error('Failed to fetch devices:', error)
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
  notify.success('Copied to clipboard')
}

onMounted(() => {
  fetchMyDevices()
})
</script>
