<template>
  <div>
    <AppHeader title="Revenue Intelligence" subtitle="Subscription revenue, growth trends, and financial analytics" />
    <div class="p-6 space-y-6">
      <!-- Revenue KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-500 mb-2">Monthly Revenue</p>
          <p class="text-3xl font-bold text-gray-900">$45,280</p>
          <p class="text-sm text-accent-600 mt-2">↑ 12% from last month</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-500 mb-2">Annual Revenue</p>
          <p class="text-3xl font-bold text-gray-900">$542,000</p>
          <p class="text-sm text-gray-500 mt-2">Projected ARR</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-500 mb-2">Paid Subscriptions</p>
          <p class="text-3xl font-bold text-gray-900">92</p>
          <p class="text-sm text-warning-600 mt-2">2.3% churn rate</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-500 mb-2">Avg. Revenue/Org</p>
          <p class="text-3xl font-bold text-gray-900">$492</p>
          <p class="text-sm text-accent-600 mt-2">↑ 8% growth</p>
        </div>
      </div>

      <!-- Revenue Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue by Plan</h3>
          <div class="space-y-3">
            <div>
              <p class="text-sm font-medium text-gray-700">Pro Plan</p>
              <p class="text-2xl font-bold text-gray-900">$18,540</p>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div class="bg-primary-500 h-2 rounded-full" style="width: 41%"></div>
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700">Enterprise Plan</p>
              <p class="text-2xl font-bold text-gray-900">$22,100</p>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div class="bg-accent-500 h-2 rounded-full" style="width: 49%"></div>
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700">Basic Plan</p>
              <p class="text-2xl font-bold text-gray-900">$4,640</p>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div class="bg-warning-500 h-2 rounded-full" style="width: 10%"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="text-sm font-medium text-gray-900">TechCorp Inc.</p>
                <p class="text-xs text-gray-500">Pro Plan upgrade</p>
              </div>
              <span class="text-sm font-semibold text-accent-600">+$999</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="text-sm font-medium text-gray-900">DataFlow Systems</p>
                <p class="text-xs text-gray-500">Monthly subscription</p>
              </div>
              <span class="text-sm font-semibold text-accent-600">+$2,999</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="text-sm font-medium text-gray-900">GlobalVentures</p>
                <p class="text-xs text-gray-500">Failed payment</p>
              </div>
              <span class="text-sm font-semibold text-danger-600">-$1,299</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Upgrade/Downgrade Trends -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Upgrade & Downgrade Trends</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Upgrades This Month</p>
              <p class="text-xs text-gray-500">Free/Basic → Pro/Enterprise</p>
            </div>
            <p class="text-2xl font-bold text-accent-600">+18</p>
          </div>
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Downgrades This Month</p>
              <p class="text-xs text-gray-500">Pro/Enterprise → Free/Basic</p>
            </div>
            <p class="text-2xl font-bold text-danger-600">-4</p>
          </div>
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Churn Value This Month</p>
              <p class="text-xs text-gray-500">Revenue lost to cancellations</p>
            </div>
            <p class="text-2xl font-bold text-danger-600">$2,840</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
</script>