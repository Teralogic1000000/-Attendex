<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
    <div class="mb-6">
      <h3 class="text-lg font-bold text-slate-900">Recent Activities</h3>
      <p class="text-sm text-slate-600">System activities and updates</p>
    </div>

    <!-- Activities List -->
    <div class="space-y-4">
      <div v-for="(activity, index) in activities" :key="index" class="flex gap-4 pb-4" :class="{ 'border-b border-slate-200': index !== activities.length - 1 }">
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', activity.color]">
          <svg v-if="activity.type === 'user'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2z" />
          </svg>
          <svg v-else-if="activity.type === 'attendance'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 0l3-3m-3 3H6" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-900">{{ activity.title }}</p>
          <p class="text-xs text-slate-600 mt-0.5">{{ activity.description }}</p>
          <p class="text-xs text-slate-500 mt-1">{{ activity.time }}</p>
        </div>
      </div>
    </div>

    <!-- Load More -->
    <button class="w-full mt-4 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
      Load More Activities
    </button>
  </div>
</template>

<script setup lang="ts">
const activities = [
  {
    type: 'user',
    title: 'New User Added',
    description: 'John Smith was added to the Engineering department',
    time: '2 hours ago',
    color: 'bg-orange-600'
  },
  {
    type: 'attendance',
    title: 'Attendance Recorded',
    description: '156 employees checked in successfully',
    time: '4 hours ago',
    color: 'bg-green-600'
  },
  {
    type: 'shift',
    title: 'Shift Updated',
    description: 'Morning shift schedule was updated',
    time: '1 day ago',
    color: 'bg-orange-500'
  },
  {
    type: 'user',
    title: 'User Status Changed',
    description: 'Emma Davis status changed to inactive',
    time: '2 days ago',
    color: 'bg-orange-600'
  },
  {
    type: 'attendance',
    title: 'Report Generated',
    description: 'Weekly attendance report is ready for download',
    time: '3 days ago',
    color: 'bg-orange-600'
  }
]
</script>
