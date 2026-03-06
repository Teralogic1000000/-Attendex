<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
    <div class="mb-6">
      <h3 class="text-lg font-bold text-slate-900">Attendance Analytics</h3>
      <p class="text-sm text-slate-600">Last 7 days overview</p>
    </div>

    <!-- Simple Bar Chart -->
    <div class="space-y-4">
      <div v-for="(item, index) in chartData" :key="index" class="flex items-end gap-3 h-32">
        <div class="flex-1">
          <div class="bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg h-full relative group hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer" :style="{ height: item.percentage + '%' }">
            <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {{ item.count }} ({{ item.percentage }}%)
            </div>
          </div>
          <p class="text-xs text-slate-600 mt-2 text-center">{{ item.day }}</p>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-6 pt-4 border-t border-slate-200">
      <div class="grid grid-cols-2 gap-4 text-xs">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-green-500 rounded"></div>
          <span class="text-slate-600">Present</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-red-500 rounded"></div>
          <span class="text-slate-600">Absent</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const chartData = [
  { day: 'Mon', count: 156, percentage: 85 },
  { day: 'Tue', count: 162, percentage: 88 },
  { day: 'Wed', count: 145, percentage: 79 },
  { day: 'Thu', count: 158, percentage: 86 },
  { day: 'Fri', count: 164, percentage: 89 },
  { day: 'Sat', count: 95, percentage: 52 },
  { day: 'Sun', count: 88, percentage: 48 }
]
</script>
