<template>
  <div>
    <AppHeader title="Global Analytics" subtitle="Platform-wide intelligence and performance insights" />
    <div class="p-6 space-y-6">
      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-500 mb-2">Avg. Attendance Rate</p>
          <p class="text-3xl font-bold text-gray-900">87.4%</p>
          <p class="text-sm text-gray-500 mt-2">Across all organizations</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-500 mb-2">Top Performer</p>
          <p class="text-xl font-bold text-gray-900">TechCorp Inc.</p>
          <p class="text-sm text-accent-600 mt-2">94.2% attendance</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-500 mb-2">Late Check-ins</p>
          <p class="text-3xl font-bold text-gray-900">8.2%</p>
          <p class="text-sm text-warning-600 mt-2">Slightly above average</p>
        </div>
      </div>

      <!-- Insights Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Abnormal Patterns Detected</h3>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            <div class="p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <p class="text-sm font-medium text-warning-900">High Absence Rate</p>
              <p class="text-xs text-warning-700">GlobalVentures showing 25% absence spike</p>
            </div>
            <div class="p-3 bg-accent-50 border border-accent-200 rounded-lg">
              <p class="text-sm font-medium text-accent-900">Peak Activity</p>
              <p class="text-xs text-accent-700">DataFlow Systems above normal check-in levels</p>
            </div>
            <div class="p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <p class="text-sm font-medium text-danger-900">Unusual Pattern</p>
              <p class="text-xs text-danger-700">Weekend check-ins detected for Corp Solutions</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Regional Performance</h3>
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium text-gray-700">North America</p>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div class="bg-accent-500 h-2 rounded-full" style="width: 89%"></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">89% attendance</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700">Europe</p>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div class="bg-primary-500 h-2 rounded-full" style="width: 85%"></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">85% attendance</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700">Asia Pacific</p>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div class="bg-warning-500 h-2 rounded-full" style="width: 82%"></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">82% attendance</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Employee Activity Insights -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Platform Employee Activity Summary</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="p-4 bg-gray-50 rounded-lg text-center">
            <p class="text-sm text-gray-600 mb-2">Total Employees</p>
            <p class="text-2xl font-bold text-gray-900">5,280</p>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg text-center">
            <p class="text-sm text-gray-600 mb-2">Active Today</p>
            <p class="text-2xl font-bold text-accent-600">4,156</p>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg text-center">
            <p class="text-sm text-gray-600 mb-2">Avg. Hours/Day</p>
            <p class="text-2xl font-bold text-gray-900">8.2h</p>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg text-center">
            <p class="text-sm text-gray-600 mb-2">Overtime</p>
            <p class="text-2xl font-bold text-warning-600">12%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
</script>