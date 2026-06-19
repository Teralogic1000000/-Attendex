<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">Request Approvals</h1>

    <!-- Status Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">Pending</p>
        <p class="text-2xl font-bold text-gray-900">{{ pendingCount }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">Approved</p>
        <p class="text-2xl font-bold text-green-600">{{ approvedCount }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">Rejected</p>
        <p class="text-2xl font-bold text-danger-600">{{ rejectedCount }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <p class="text-sm text-gray-600">Total</p>
        <p class="text-2xl font-bold text-gray-900">{{ requests.length }}</p>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-4 border-b border-gray-200">
      <button
        v-for="status in ['All', 'Pending', 'Approved', 'Rejected']"
        :key="status"
        @click="activeStatus = status"
        :class="[
          'px-6 py-3 font-medium border-b-2 transition-colors',
          activeStatus === status
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        ]"
      >
        {{ status }}
      </button>
    </div>

    <!-- Requests List -->
    <div class="space-y-4">
      <div
        v-for="req in filteredRequests"
        :key="req.id"
        class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ req.employeeName }}</h3>
            <p class="text-sm text-gray-600">{{ req.type }}</p>
          </div>
          <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusBadge(req.status)]">
            {{ req.status }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p class="text-gray-600">From</p>
            <p class="font-medium text-gray-900">{{ formatDate(req.startDate) }}</p>
          </div>
          <div v-if="req.type === 'Leave Request'">
            <p class="text-gray-600">To</p>
            <p class="font-medium text-gray-900">{{ formatDate(req.endDate) }}</p>
          </div>
          <div>
            <p class="text-gray-600">Duration</p>
            <p class="font-medium text-gray-900">{{ req.duration }}</p>
          </div>
          <div>
            <p class="text-gray-600">Submission Date</p>
            <p class="font-medium text-gray-900">{{ formatDate(req.submittedAt) }}</p>
          </div>
        </div>

        <div v-if="req.reason" class="mb-4 p-3 bg-gray-50 rounded-lg">
          <p class="text-xs font-medium text-gray-600 mb-1">Reason</p>
          <p class="text-sm text-gray-900">{{ req.reason }}</p>
        </div>

        <div v-if="req.status === 'Pending'" class="flex gap-3">
          <button
            @click="approveRequest(req.id)"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Approve
          </button>
          <button
            @click="rejectRequest(req.id)"
            class="flex-1 px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors font-medium"
          >
            Reject
          </button>
        </div>
        <div v-else class="text-sm text-gray-600">
          Processed on {{ formatDate(req.processedAt) }}
        </div>
      </div>

      <div v-if="filteredRequests.length === 0" class="text-center py-12 text-gray-500">
        No requests found
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeStatus = ref('All')

const requests = ref([
  {
    id: 1,
    employeeName: 'John Doe',
    type: 'Leave Request',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-04-05'),
    duration: '5 days',
    reason: 'Personal leave',
    status: 'Pending',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60000),
    processedAt: null
  },
  {
    id: 2,
    employeeName: 'Jane Smith',
    type: 'Overtime Request',
    startDate: new Date('2024-03-28'),
    duration: '4 hours',
    reason: 'Project deadline',
    status: 'Approved',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60000),
    processedAt: new Date(Date.now() - 4 * 24 * 60 * 60000)
  },
  {
    id: 3,
    employeeName: 'Bob Wilson',
    type: 'Leave Request',
    startDate: new Date('2024-03-20'),
    duration: '7 days',
    reason: 'Vacation',
    status: 'Rejected',
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60000),
    processedAt: new Date(Date.now() - 8 * 24 * 60 * 60000)
  }
])

const filteredRequests = computed(() => {
  if (activeStatus.value === 'All') return requests.value
  return requests.value.filter(r => r.status === activeStatus.value)
})

const pendingCount = computed(() => requests.value.filter(r => r.status === 'Pending').length)
const approvedCount = computed(() => requests.value.filter(r => r.status === 'Approved').length)
const rejectedCount = computed(() => requests.value.filter(r => r.status === 'Rejected').length)

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getStatusBadge(status) {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'Approved':
      return 'bg-green-100 text-green-800'
    case 'Rejected':
      return 'bg-danger-100 text-danger-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function approveRequest(id) {
  const req = requests.value.find(r => r.id === id)
  if (req) {
    req.status = 'Approved'
    req.processedAt = new Date()
  }
}

function rejectRequest(id) {
  const req = requests.value.find(r => r.id === id)
  if (req) {
    req.status = 'Rejected'
    req.processedAt = new Date()
  }
}
</script>
