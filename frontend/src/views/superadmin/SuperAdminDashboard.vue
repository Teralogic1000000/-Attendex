<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Dashboard Content -->
    <main class="p-6">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Page Header with Controls -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p class="text-gray-600 mt-2">Platform overview and key metrics</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="handleRefreshData"
              :disabled="superAdminStore.loading"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {{ superAdminStore.loading ? 'Loading...' : 'Refresh' }}
            </button>
            <button
              @click="navigateTo('/superadmin/settings')"
              class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
            >
              Settings
            </button>
          </div>
        </div>

        <!-- KPI Cards (6 metrics) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <!-- Organizations Card - Click to navigate -->
          <button
            @click="navigateTo('/superadmin/organizations')"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-green-400 transition-all text-left"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Organizations</p>
                <p class="text-2xl font-bold text-gray-900 mt-2">{{ formatNumber(stats.totalOrganizations) }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ stats.activeOrganizations }} active</p>
              </div>
              <div class="p-2 bg-green-100 rounded-lg">
                <Building2 class="w-5 h-5 text-green-600" />
              </div>
            </div>
          </button>

          <!-- Total Employees Card - Click to navigate -->
          <button
            @click="navigateTo('/superadmin/organizations')"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-400 transition-all text-left"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Employees</p>
                <p class="text-2xl font-bold text-gray-900 mt-2">{{ formatNumber(stats.totalEmployees) }}</p>
                <p class="text-xs text-gray-500 mt-1">Across all orgs</p>
              </div>
              <div class="p-2 bg-blue-100 rounded-lg">
                <Users class="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </button>

          <!-- Check-ins Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Check-ins</p>
                <p class="text-2xl font-bold text-gray-900 mt-2">{{ formatNumber(stats.todayCheckins) }}</p>
                <p class="text-xs text-gray-500 mt-1">Global activity</p>
              </div>
              <div class="p-2 bg-purple-100 rounded-lg">
                <UserCheck class="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <!-- MRR Card - Click to revenue page -->
          <button
            @click="navigateTo('/superadmin/revenue')"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-yellow-400 transition-all text-left"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">MRR</p>
                <p class="text-2xl font-bold text-gray-900 mt-2">${{ formatNumber(stats.mrr) }}</p>
                <p class="text-xs text-green-600 mt-1">+{{ stats.mrrGrowth }}% from last month</p>
              </div>
              <div class="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp class="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </button>

          <!-- Active Subscriptions Card - Click to subscriptions -->
          <button
            @click="navigateTo('/superadmin/subscriptions')"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-green-400 transition-all text-left"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Subscriptions</p>
                <p class="text-2xl font-bold text-gray-900 mt-2">{{ formatNumber(stats.activeSubscriptions) }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ stats.paidSubscriptions }} paid</p>
              </div>
              <div class="p-2 bg-green-100 rounded-lg">
                <CreditCard class="w-5 h-5 text-green-600" />
              </div>
            </div>
          </button>

          <!-- Churn Rate Card - Click to analytics -->
          <button
            @click="navigateTo('/superadmin/analytics')"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-red-400 transition-all text-left"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Churn Rate</p>
                <p class="text-2xl font-bold text-gray-900 mt-2">{{ stats.churnRate }}%</p>
                <p class="text-xs text-red-600 mt-1">Last 30 days</p>
              </div>
              <div class="p-2 bg-red-100 rounded-lg">
                <TrendingDown class="w-5 h-5 text-red-600" />
              </div>
            </div>
          </button>
        </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Organization Growth -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Organization Growth (6 Months)</h3>
              <button
                @click="navigateTo('/superadmin/analytics')"
                class="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View Details →
              </button>
            </div>
            <div class="h-64">
              <Line v-if="chartReady" :data="growthChartData" :options="chartOptions" />
              <div v-else class="flex h-full items-center justify-center text-gray-400 text-sm">
                Loading chart data...
              </div>
            </div>
          </div>

          <!-- Revenue Trend -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Revenue Trend (MRR)</h3>
              <button
                @click="navigateTo('/superadmin/revenue')"
                class="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View Details →
              </button>
            </div>
            <div class="h-64">
              <Bar v-if="chartReady" :data="revenueChartData" :options="chartOptions" />
              <div v-else class="flex h-full items-center justify-center text-gray-400 text-sm">
                Loading chart data...
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Global Attendance Trend -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Global Attendance Trend</h3>
              <button
                @click="navigateTo('/superadmin/monitoring')"
                class="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View Details →
              </button>
            </div>
            <div class="h-64">
              <Line v-if="chartReady" :data="attendanceChartData" :options="chartOptions" />
              <div v-else class="flex h-full items-center justify-center text-gray-400 text-sm">
                Loading chart data...
              </div>
            </div>
          </div>

          <!-- Plan Distribution -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Subscription Plan Distribution</h3>
              <button
                @click="navigateTo('/superadmin/subscriptions')"
                class="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View Details →
              </button>
            </div>
            <div class="h-64">
              <Doughnut v-if="chartReady" :data="planChartData" :options="doughnutChartOptions" />
              <div v-else class="flex h-full items-center justify-center text-gray-400 text-sm">
                Loading chart data...
              </div>
            </div>
          </div>
        </div>

      <!-- Debug Info Section (Development) -->
      <div v-if="isDevelopment" class="mt-8 max-w-7xl mx-auto">
        <details class="bg-gray-100 rounded-lg p-4 text-sm font-mono text-gray-700">
          <summary class="cursor-pointer font-bold text-gray-900 mb-2">📊 Dashboard Data Debug</summary>
          <div class="mt-2 space-y-2 bg-white p-3 rounded max-h-96 overflow-auto">
            <div>🔄 Store Loading: <span class="text-blue-600">{{ superAdminStore.loading }}</span></div>
            <div>❌ Store Error: <span class="text-red-600">{{ superAdminStore.error || 'None' }}</span></div>
            <div>📦 Overview Data: <pre class="text-xs bg-gray-100 p-2 rounded">{{ JSON.stringify(superAdminStore.systemOverview, null, 2) }}</pre></div>
            <div>📈 Analytics Data: <pre class="text-xs bg-gray-100 p-2 rounded">{{ JSON.stringify(superAdminStore.systemAnalytics, null, 2) }}</pre></div>
            <div>🏢 Organizations: <span class="text-blue-600">{{ superAdminStore.organizations.length }}</span> items</div>
            <div>📋 Audit Logs: <span class="text-blue-600">{{ superAdminStore.auditLogs.length }}</span> items</div>
          </div>
        </details>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSuperAdminStore } from '@/stores/superAdminDash'
import { formatNumber } from '@/utils/helpers'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

import {
  Building2,
  Users,
  UserCheck,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Activity,
  LogOut,
} from 'lucide-vue-next'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const authStore = useAuthStore()
const superAdminStore = useSuperAdminStore()
const router = useRouter()
const chartReady = ref(false)

// Check if development environment
const isDevelopment = import.meta.env.DEV

// Computed stats from real API data with fallback mock data
const stats = computed(() => {
  const overview = superAdminStore.systemOverview
  const analytics = superAdminStore.systemAnalytics

  return {
    // From overview endpoint
    totalOrganizations: overview?.organizations?.total || 45,
    activeOrganizations: overview?.organizations?.byStatus?.ACTIVE || 38,
    totalEmployees: overview?.users?.total || 1280,
    todayCheckins: overview?.attendance?.today || 856,
    
    // From analytics endpoint (organization growth)
    mrr: overview?.subscriptions?.activePaid ? (overview.subscriptions.activePaid * 2041) : 245000,
    mrrGrowth: 12.5,
    activeSubscriptions: overview?.subscriptions?.activePaid || 120,
    paidSubscriptions: overview?.subscriptions?.activePaid || 95,
    churnRate: analytics?.totalNewOrganizations ? ((analytics.totalNewOrganizations / (overview?.organizations?.total || 1000)) * 100).toFixed(1) : 2.3,
    activeSessions: overview?.users?.total ? Math.floor(overview.users.total * 0.25) : 324,
    failedLogins: 12,
    dbConnections: 42,
  }
})

// Activity feed from audit logs
const activityFeed = computed(() => {
  return superAdminStore.auditLogs.slice(0, 4).map(log => ({
    title: log.action,
    description: log.details || `${log.resourceType}: ${log.resourceId}`,
    time: new Date(log.createdAt).toLocaleString(),
    icon: getActivityIcon(log.action),
    borderColor: getActivityBorderColor(log.action),
    iconColor: getActivityIconColor(log.action),
  }))
})

// Chart data from analytics
const growthChartData = computed(() => {
  const analytics = superAdminStore.systemAnalytics
  const dailyNew = analytics?.dailyNew || {}
  
  const labels = Object.keys(dailyNew).slice(-6) // Last 6 days
  const data = labels.map(date => dailyNew[date] || 0)
  
  return {
    labels: labels.length > 0 ? labels : ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    datasets: [{
      label: 'New Organizations',
      borderColor: '#1e293b',
      backgroundColor: 'rgba(30, 41, 59, 0.1)',
      data: data.length > 0 ? data : [12, 19, 15, 25, 22, 32],
      tension: 0.4,
      fill: true,
    }],
  }
})

const revenueChartData = computed(() => {
  const overview = superAdminStore.systemOverview
  // Simulate revenue with subscription data if available
  const subscriptions = overview?.subscriptions?.activePaid || 95
  const mockRevenue = [28500, 31200, 29800, 38900, 42150, subscriptions * 2041]
  
  return {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    datasets: [{
      label: 'Monthly Revenue',
      backgroundColor: '#eab308',
      borderRadius: 6,
      data: mockRevenue,
    }],
  }
})

const attendanceChartData = computed(() => {
  const overview = superAdminStore.systemOverview
  // Base attendance data, scale by today's attendance
  const todayCheckins = overview?.attendance?.today || 856
  const scaleFactor = todayCheckins / 3400
  
  return {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    datasets: [{
      label: 'Check-ins',
      borderColor: '#059669',
      backgroundColor: 'rgba(5, 150, 105, 0.1)',
      data: [3400, 3800, 3950, 4200, 4080, todayCheckins].map(v => Math.round(v * scaleFactor)),
      tension: 0.4,
      fill: true,
    }],
  }
})

const planChartData = computed(() => {
  return {
    labels: ['Free', 'Basic', 'Pro', 'Enterprise'],
    datasets: [{
      data: [28, 39, 35, 16],
      backgroundColor: ['#1e293b', '#eab308', '#059669', '#0ea5e9'],
      borderWidth: 0,
    }],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { precision: 0 },
      grid: { color: '#f3f4f6' },
    },
    x: {
      grid: { display: false },
    },
  },
}

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { padding: 16, usePointStyle: true, pointStyle: 'circle' },
    },
  },
}

// Helper functions for activity feed
const getActivityIcon = (action) => {
  if (action.includes('upgrade') || action.includes('subscribe')) return TrendingUp
  if (action.includes('suspend') || action.includes('disable')) return XCircle
  if (action.includes('payment') || action.includes('billing')) return CreditCard
  return Building2
}

const getActivityBorderColor = (action) => {
  if (action.includes('upgrade') || action.includes('subscribe')) return 'border-accent-500'
  if (action.includes('suspend') || action.includes('disable')) return 'border-danger-500'
  if (action.includes('payment') || action.includes('billing')) return 'border-warning-500'
  return 'border-primary-500'
}

const getActivityIconColor = (action) => {
  if (action.includes('upgrade') || action.includes('subscribe')) return 'text-accent-600'
  if (action.includes('suspend') || action.includes('disable')) return 'text-danger-600'
  if (action.includes('payment') || action.includes('billing')) return 'text-warning-600'
  return 'text-primary-600'
}

const logout = () => {
  authStore.logout()
}

// Load real data on mount
onMounted(async () => {
  try {
    chartReady.value = false
    console.log('Starting dashboard data load...')
    
    // Fetch all dashboard data
    console.log('Fetching system overview...')
    const overview = await superAdminStore.fetchSystemOverview()
    console.log('System Overview:', overview)
    
    console.log('Fetching system analytics...')
    const analytics = await superAdminStore.fetchSystemAnalytics(30)
    console.log('System Analytics:', analytics)

    // Fetch organizations and audit logs
    console.log('Fetching organizations...')
    const orgs = await superAdminStore.fetchOrganizations(1, 10)
    console.log('Organizations:', orgs)
    
    console.log('Fetching audit logs...')
    const logs = await superAdminStore.fetchAuditLogs(1, 10)
    console.log('Audit Logs:', logs)

    console.log('Dashboard data loaded successfully')
    chartReady.value = true
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    chartReady.value = true
  }
})

// Methods for button actions
const handleRefreshData = async () => {
  try {
    chartReady.value = false
    await superAdminStore.fetchSystemOverview()
    await superAdminStore.fetchSystemAnalytics(30)
    chartReady.value = true
    console.log('Data refreshed successfully')
  } catch (error) {
    console.error('Failed to refresh data:', error)
    chartReady.value = true
  }
}

const navigateTo = (path) => {
  router.push(path)
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}</script>
