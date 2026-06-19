<template>
  <div>
    <AppHeader title="Subscription Management" subtitle="Manage plans, pricing, and subscription features" />
    <div class="p-6 space-y-6">
      <!-- Subscription Plans Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-500 mb-2">Free Plan</p>
          <p class="text-2xl font-bold text-gray-900">28</p>
          <p class="text-xs text-gray-500 mt-2">Organizations</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-500 mb-2">Basic Plan</p>
          <p class="text-2xl font-bold text-gray-900">21</p>
          <p class="text-xs text-gray-500 mt-2">Organizations</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-500 mb-2">Pro Plan</p>
          <p class="text-2xl font-bold text-gray-900">56</p>
          <p class="text-xs text-gray-500 mt-2">Organizations</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-500 mb-2">Enterprise Plan</p>
          <p class="text-2xl font-bold text-gray-900">22</p>
          <p class="text-xs text-gray-500 mt-2">Organizations</p>
        </div>
      </div>

      <!-- Plan Management -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Manage Plans</h3>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
            + Create Plan
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-4 py-2 text-left font-semibold text-gray-900">Plan Name</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-900">Price/Month</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-900">Max Employees</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-900">Organizations</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">Free</td>
                <td class="px-4 py-3 text-gray-900">$0</td>
                <td class="px-4 py-3 text-gray-900">10</td>
                <td class="px-4 py-3 text-gray-900">28</td>
                <td class="px-4 py-3"><button class="text-primary-600 hover:text-primary-700 text-sm font-medium">Edit</button></td>
              </tr>
              <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">Basic</td>
                <td class="px-4 py-3 text-gray-900">$99.99</td>
                <td class="px-4 py-3 text-gray-900">50</td>
                <td class="px-4 py-3 text-gray-900">21</td>
                <td class="px-4 py-3"><button class="text-primary-600 hover:text-primary-700 text-sm font-medium">Edit</button></td>
              </tr>
              <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">Pro</td>
                <td class="px-4 py-3 text-gray-900">$499.99</td>
                <td class="px-4 py-3 text-gray-900">500</td>
                <td class="px-4 py-3 text-gray-900">56</td>
                <td class="px-4 py-3"><button class="text-primary-600 hover:text-primary-700 text-sm font-medium">Edit</button></td>
              </tr>
              <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">Enterprise</td>
                <td class="px-4 py-3 text-gray-900">Custom</td>
                <td class="px-4 py-3 text-gray-900">Unlimited</td>
                <td class="px-4 py-3 text-gray-900">22</td>
                <td class="px-4 py-3"><button class="text-primary-600 hover:text-primary-700 text-sm font-medium">Edit</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Feature Toggles -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Feature Availability by Plan</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-4 py-2 text-left font-semibold text-gray-900">Feature</th>
                <th class="px-4 py-2 text-center font-semibold text-gray-900">Free</th>
                <th class="px-4 py-2 text-center font-semibold text-gray-900">Basic</th>
                <th class="px-4 py-2 text-center font-semibold text-gray-900">Pro</th>
                <th class="px-4 py-2 text-center font-semibold text-gray-900">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b">
                <td class="px-4 py-3 text-gray-900">Basic Check-in</td>
                <td class="px-4 py-3 text-center"><span class="text-accent-600">✓</span></td>
                <td class="px-4 py-3 text-center"><span class="text-accent-600">✓</span></td>
                <td class="px-4 py-3 text-center"><span class="text-accent-600">✓</span></td>
                <td class="px-4 py-3 text-center"><span class="text-accent-600">✓</span></td>
              </tr>
              <tr class="border-b">
                <td class="px-4 py-3 text-gray-900">GPS Tracking</td>
                <td class="px-4 py-3 text-center">-</td>
                <td class="px-4 py-3 text-center"><span class="text-accent-600">✓</span></td>
                <td class="px-4 py-3 text-center"><span class="text-accent-600">✓</span></td>
                <td class="px-4 py-3 text-center"><span class="text-accent-600">✓</span></td>
              </tr>
              <tr class="border-b">
                <td class="px-4 py-3 text-gray-900">Advanced Analytics</td>
                <td class="px-4 py-3 text-center">-</td>
                <td class="px-4 py-3 text-center">-</td>
                <td class="px-4 py-3 text-center"><span class="text-accent-600">✓</span></td>
                <td class="px-4 py-3 text-center"><span class="text-accent-600">✓</span></td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-gray-900">Custom Integration</td>
                <td class="px-4 py-3 text-center">-</td>
                <td class="px-4 py-3 text-center">-</td>
                <td class="px-4 py-3 text-center">-</td>
                <td class="px-4 py-3 text-center"><span class="text-accent-600">✓</span></td>
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