<template>
  <div>
    <AppHeader title="System Monitoring" subtitle="Real-time system health, API status, and infrastructure metrics" />
    <div class="p-6 space-y-6">
      <!-- System Health Status -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-2">System Uptime</p>
              <p class="text-3xl font-bold text-gray-900">99.9%</p>
            </div>
            <div class="w-3 h-3 bg-accent-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-500 mb-2">API Response Time</p>
          <p class="text-3xl font-bold text-gray-900">45ms</p>
          <p class="text-xs text-accent-600 mt-2">Optimal performance</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-500 mb-2">Active Sessions</p>
          <p class="text-3xl font-bold text-gray-900">342</p>
          <p class="text-xs text-gray-500 mt-2">Concurrent users</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-500 mb-2">Failed Requests</p>
          <p class="text-3xl font-bold text-gray-900">8</p>
          <p class="text-xs text-gray-500 mt-2">Last 24 hours</p>
        </div>
      </div>

      <!-- Service Status -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Service Status Indicators</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200">
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-accent-500 rounded-full"></div>
              <p class="text-sm font-medium text-gray-900">API Server</p>
            </div>
            <div class="flex items-center space-x-2">
              <p class="text-xs text-gray-500">Healthy</p>
              <span class="text-xs font-semibold text-accent-600">Online</span>
            </div>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200">
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-accent-500 rounded-full"></div>
              <p class="text-sm font-medium text-gray-900">Database Connection</p>
            </div>
            <div class="flex items-center space-x-2">
              <p class="text-xs text-gray-500">Responsive</p>
              <span class="text-xs font-semibold text-accent-600">Online</span>
            </div>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200">
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-warning-500 rounded-full"></div>
              <p class="text-sm font-medium text-gray-900">Email Service</p>
            </div>
            <div class="flex items-center space-x-2">
              <p class="text-xs text-gray-500">Degraded</p>
              <span class="text-xs font-semibold text-warning-600">Warning</span>
            </div>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200">
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-accent-500 rounded-full"></div>
              <p class="text-sm font-medium text-gray-900">Cache Layer</p>
            </div>
            <div class="flex items-center space-x-2">
              <p class="text-xs text-gray-500">Operational</p>
              <span class="text-xs font-semibold text-accent-600">Online</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Database Metrics</h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-1">
                <p class="text-sm text-gray-700">CPU Usage</p>
                <span class="text-sm font-semibold">45%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-primary-500 h-2 rounded-full" style="width: 45%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between mb-1">
                <p class="text-sm text-gray-700">Memory Usage</p>
                <span class="text-sm font-semibold">62%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-warning-500 h-2 rounded-full" style="width: 62%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between mb-1">
                <p class="text-sm text-gray-700">Disk Usage</p>
                <span class="text-sm font-semibold">35%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-accent-500 h-2 rounded-full" style="width: 35%"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Error Logs (Last 24h)</h3>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div class="p-2 bg-danger-50 border border-danger-200 rounded text-xs">
              <p class="font-monospace text-danger-900">ERROR: Database connection timeout at 14:32</p>
            </div>
            <div class="p-2 bg-warning-50 border border-warning-200 rounded text-xs">
              <p class="font-monospace text-warning-900">WARN: High memory usage detected - 78%</p>
            </div>
            <div class="p-2 bg-warning-50 border border-warning-200 rounded text-xs">
              <p class="font-monospace text-warning-900">WARN: Slow query detected - 2.5s execution</p>
            </div>
            <div class="p-2 bg-gray-50 border border-gray-200 rounded text-xs">
              <p class="font-monospace text-gray-600">INFO: Database backup completed successfully</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
</script>