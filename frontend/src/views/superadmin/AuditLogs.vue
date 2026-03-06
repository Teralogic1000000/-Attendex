<template>
  <div>
    <AppHeader title="Audit Logs" subtitle="Compliance-ready audit trail of platform activities" />
    <div class="p-6 space-y-6">
      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Filter Logs</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Custom</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option>All Actions</option>
              <option>Organization Suspended</option>
              <option>Plan Upgraded</option>
              <option>Login Failed</option>
              <option>Subscription Modified</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Actor</label>
            <input type="text" placeholder="Admin email..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Organization</label>
            <input type="text" placeholder="Org name..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
        </div>
        <div class="mt-4 flex justify-between">
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Filter
          </button>
          <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      <!-- Audit Log Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Activity Log</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-4 py-2 text-left font-semibold text-gray-900">Timestamp</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-900">Action</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-900">Resource</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-900">Organization</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-900">Actor</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-600">2026-03-04 14:32</td>
                <td class="px-4 py-3 font-medium text-gray-900">Organization Suspended</td>
                <td class="px-4 py-3 text-gray-900">GlobalVentures</td>
                <td class="px-4 py-3 text-gray-900">GlobalVentures Inc.</td>
                <td class="px-4 py-3 text-gray-900">sa@attendex.io</td>
                <td class="px-4 py-3"><span class="text-xs px-2 py-1 bg-danger-100 text-danger-700 rounded">Suspended</span></td>
              </tr>
              <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-600">2026-03-04 12:15</td>
                <td class="px-4 py-3 font-medium text-gray-900">Plan Upgraded</td>
                <td class="px-4 py-3 text-gray-900">Subscription</td>
                <td class="px-4 py-3 text-gray-900">TechCorp Inc.</td>
                <td class="px-4 py-3 text-gray-900">admin@techcorp.com</td>
                <td class="px-4 py-3"><span class="text-xs px-2 py-1 bg-accent-100 text-accent-700 rounded">Success</span></td>
              </tr>
              <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-600">2026-03-04 10:45</td>
                <td class="px-4 py-3 font-medium text-gray-900">Login Failed</td>
                <td class="px-4 py-3 text-gray-900">User</td>
                <td class="px-4 py-3 text-gray-900">DataFlow Systems</td>
                <td class="px-4 py-3 text-gray-900">user@dataflow.com</td>
                <td class="px-4 py-3"><span class="text-xs px-2 py-1 bg-danger-100 text-danger-700 rounded">Failed</span></td>
              </tr>
              <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-600">2026-03-04 08:20</td>
                <td class="px-4 py-3 font-medium text-gray-900">Subscription Modified</td>
                <td class="px-4 py-3 text-gray-900">Subscription</td>
                <td class="px-4 py-3 text-gray-900">CorpSolutions Ltd.</td>
                <td class="px-4 py-3 text-gray-900">sa@attendex.io</td>
                <td class="px-4 py-3"><span class="text-xs px-2 py-1 bg-accent-100 text-accent-700 rounded">Success</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
</script>