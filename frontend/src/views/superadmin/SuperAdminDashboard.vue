<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center justify-center h-16 px-4 border-b border-slate-700">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Shield class="w-5 h-5 text-white" />
          </div>
          <h1 class="text-lg font-bold text-white">Attendex</h1>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <!-- PRIMARY SECTION -->
        <div class="mb-6">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-3">Control Center</p>
          <ul class="space-y-1">
            <li>
              <router-link
                to="/superadmin/dashboard"
                class="flex items-center px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                :class="$route.path === '/superadmin/dashboard' ? 'bg-primary-600 text-white' : ''"
              >
                <LayoutDashboard class="w-5 h-5 mr-3" />
                Overview
              </router-link>
            </li>
            <li>
              <router-link
                to="/superadmin/organizations"
                class="flex items-center px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                :class="$route.path === '/superadmin/organizations' ? 'bg-primary-600 text-white' : ''"
              >
                <Building2 class="w-5 h-5 mr-3" />
                Organizations
              </router-link>
            </li>
          </ul>
        </div>

        <!-- BILLING SECTION -->
        <div class="mb-6">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-3">Billing & Revenue</p>
          <ul class="space-y-1">
            <li>
              <router-link
                to="/superadmin/revenue"
                class="flex items-center px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                :class="$route.path === '/superadmin/revenue' ? 'bg-primary-600 text-white' : ''"
              >
                <TrendingUp class="w-5 h-5 mr-3" />
                Revenue Intelligence
              </router-link>
            </li>
            <li>
              <router-link
                to="/superadmin/subscriptions"
                class="flex items-center px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                :class="$route.path === '/superadmin/subscriptions' ? 'bg-primary-600 text-white' : ''"
              >
                <CreditCard class="w-5 h-5 mr-3" />
                Subscriptions
              </router-link>
            </li>
          </ul>
        </div>

        <!-- MONITORING SECTION -->
        <div class="mb-6">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-3">Platform Operations</p>
          <ul class="space-y-1">
            <li>
              <router-link
                to="/superadmin/analytics"
                class="flex items-center px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                :class="$route.path === '/superadmin/analytics' ? 'bg-primary-600 text-white' : ''"
              >
                <BarChart3 class="w-5 h-5 mr-3" />
                Global Analytics
              </router-link>
            </li>
            <li>
              <router-link
                to="/superadmin/monitoring"
                class="flex items-center px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                :class="$route.path === '/superadmin/monitoring' ? 'bg-primary-600 text-white' : ''"
              >
                <Activity class="w-5 h-5 mr-3" />
                System Monitoring
              </router-link>
            </li>
            <li>
              <router-link
                to="/superadmin/audit-logs"
                class="flex items-center px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                :class="$route.path === '/superadmin/audit-logs' ? 'bg-primary-600 text-white' : ''"
              >
                <FileText class="w-5 h-5 mr-3" />
                Audit Logs
              </router-link>
            </li>
          </ul>
        </div>

        <!-- SUPPORT SECTION -->
        <div class="mb-6">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-3">Support & Settings</p>
          <ul class="space-y-1">
            <li>
              <router-link
                to="/superadmin/support"
                class="flex items-center px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                :class="$route.path === '/superadmin/support' ? 'bg-primary-600 text-white' : ''"
              >
                <HelpCircle class="w-5 h-5 mr-3" />
                Support Tools
              </router-link>
            </li>
            <li>
              <router-link
                to="/superadmin/settings"
                class="flex items-center px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                :class="$route.path === '/superadmin/settings' ? 'bg-primary-600 text-white' : ''"
              >
                <Settings class="w-5 h-5 mr-3" />
                Platform Settings
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Footer -->
      <div class="px-4 py-4 border-t border-slate-700">
        <div class="text-xs text-slate-400">
          <p class="mb-2 font-semibold">System Status</p>
          <div class="flex items-center space-x-2">
            <div :class="['w-2 h-2 rounded-full', systemHealthy ? 'bg-accent-500' : 'bg-danger-500']"></div>
            <span>{{ systemHealthy ? 'All Systems Operational' : 'Issues Detected' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Navigation -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center flex-1">
            <button
              @click="sidebarOpen = !sidebarOpen"
              class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu class="w-6 h-6" />
            </button>
            <h2 class="ml-4 lg:ml-0 text-lg font-semibold text-gray-900">Super Admin Control Center</h2>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Global Search -->
            <div class="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
              <Search class="w-4 h-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search organizations..."
                class="bg-transparent text-sm placeholder-gray-500 focus:outline-none w-32"
              />
            </div>

            <!-- System Health -->
            <div class="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-100 text-accent-800">
              <Activity class="w-4 h-4 mr-1" />
              <span>Healthy</span>
            </div>

            <!-- Notifications -->
            <div class="relative">
              <button class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <Bell class="w-6 h-6" />
              </button>
              <span class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger-400 ring-2 ring-white"></span>
            </div>

            <!-- Profile Menu -->
            <div class="relative">
              <button
                @click="profileMenuOpen = !profileMenuOpen"
                class="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <div class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-medium text-sm">
                  SA
                </div>
                <ChevronDown class="w-4 h-4" />
              </button>
              <div
                v-if="profileMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
              >
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <a href="#" @click="logout" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Dashboard Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-7xl mx-auto space-y-6">
          <!-- KPI Cards (6 metrics) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Organizations</p>
                  <p class="text-2xl font-bold text-gray-900 mt-2">{{ formatNumber(stats.totalOrganizations) }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ stats.activeOrganizations }} active</p>
                </div>
                <div class="p-2 bg-primary-100 rounded-lg">
                  <Building2 class="w-5 h-5 text-primary-600" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Employees</p>
                  <p class="text-2xl font-bold text-gray-900 mt-2">{{ formatNumber(stats.totalEmployees) }}</p>
                  <p class="text-xs text-gray-500 mt-1">Across all orgs</p>
                </div>
                <div class="p-2 bg-accent-100 rounded-lg">
                  <Users class="w-5 h-5 text-accent-600" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Check-ins</p>
                  <p class="text-2xl font-bold text-gray-900 mt-2">{{ formatNumber(stats.todayCheckins) }}</p>
                  <p class="text-xs text-gray-500 mt-1">Global activity</p>
                </div>
                <div class="p-2 bg-secondary-100 rounded-lg">
                  <UserCheck class="w-5 h-5 text-secondary-600" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">MRR</p>
                  <p class="text-2xl font-bold text-gray-900 mt-2">${{ formatNumber(stats.mrr) }}</p>
                  <p class="text-xs text-accent-600 mt-1">+{{ stats.mrrGrowth }}% from last month</p>
                </div>
                <div class="p-2 bg-warning-100 rounded-lg">
                  <TrendingUp class="w-5 h-5 text-warning-600" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Subscriptions</p>
                  <p class="text-2xl font-bold text-gray-900 mt-2">{{ formatNumber(stats.activeSubscriptions) }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ stats.paidSubscriptions }} paid</p>
                </div>
                <div class="p-2 bg-primary-100 rounded-lg">
                  <CreditCard class="w-5 h-5 text-primary-600" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Churn Rate</p>
                  <p class="text-2xl font-bold text-gray-900 mt-2">{{ stats.churnRate }}%</p>
                  <p class="text-xs text-danger-600 mt-1">Last 30 days</p>
                </div>
                <div class="p-2 bg-danger-100 rounded-lg">
                  <TrendingDown class="w-5 h-5 text-danger-600" />
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Organization Growth -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Organization Growth (6 Months)</h3>
              <div class="h-64">
                <Line v-if="chartReady" :data="growthChartData" :options="chartOptions" />
                <div v-else class="flex h-full items-center justify-center text-gray-400 text-sm">
                  Loading chart data...
                </div>
              </div>
            </div>

            <!-- Revenue Trend -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (MRR)</h3>
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
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Global Attendance Trend</h3>
              <div class="h-64">
                <Line v-if="chartReady" :data="attendanceChartData" :options="chartOptions" />
                <div v-else class="flex h-full items-center justify-center text-gray-400 text-sm">
                  Loading chart data...
                </div>
              </div>
            </div>

            <!-- Plan Distribution -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Subscription Plan Distribution</h3>
              <div class="h-64">
                <Doughnut v-if="chartReady" :data="planChartData" :options="doughnutChartOptions" />
                <div v-else class="flex h-full items-center justify-center text-gray-400 text-sm">
                  Loading chart data...
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Feed and Summary -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Live Activity Feed -->
            <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Platform Activity Feed</h3>
              <div class="space-y-4 max-h-96 overflow-y-auto">
                <div
                  v-for="(item, idx) in activityFeed"
                  :key="idx"
                  class="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 border-l-4"
                  :class="item.borderColor"
                >
                  <component :is="item.icon" class="w-5 h-5 mt-1 flex-shrink-0" :class="item.iconColor" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{{ item.title }}</p>
                    <p class="text-xs text-gray-500">{{ item.description }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ item.time }}</p>
                  </div>
                </div>
                <div v-if="activityFeed.length === 0" class="text-center py-8 text-gray-500">
                  <Activity class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Platform Summary</h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <p class="text-sm font-medium text-gray-700">System Uptime</p>
                    <span class="text-sm font-bold text-accent-600">99.9%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-accent-500 h-2 rounded-full" style="width: 99.9%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <p class="text-sm font-medium text-gray-700">API Health</p>
                    <span class="text-sm font-bold text-accent-600">98.5%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-accent-500 h-2 rounded-full" style="width: 98.5%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <p class="text-sm font-medium text-gray-700">Database Performance</p>
                    <span class="text-sm font-bold text-warning-600">92%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-warning-500 h-2 rounded-full" style="width: 92%"></div>
                  </div>
                </div>
              </div>

              <div class="mt-6 pt-6 border-t space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Active Sessions</span>
                  <span class="text-sm font-semibold text-gray-900">{{ stats.activeSessions }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Failed Logins</span>
                  <span class="text-sm font-semibold text-danger-600">{{ stats.failedLogins }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">DB Connections</span>
                  <span class="text-sm font-semibold text-gray-900">{{ stats.dbConnections }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Mobile Overlay -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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
import { useAuthStore } from '@/stores/auth'
import { useSuperAdminStore } from '@/stores/superAdminDash'
import { formatNumber } from '@/utils/helpers'
import {
  Building2,
  Users,
  UserCheck,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Menu,
  Bell,
  ChevronDown,
  Search,
  Activity,
  LayoutDashboard,
  BarChart3,
  FileText,
  HelpCircle,
  Settings,
  Shield,
  XCircle,
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
const sidebarOpen = ref(false)
const profileMenuOpen = ref(false)
const chartReady = ref(false)
const systemHealthy = ref(true)

// Computed stats from real API data
const stats = computed(() => {
  const overview = superAdminStore.systemOverview
  const analytics = superAdminStore.systemAnalytics

  return {
    totalOrganizations: overview.organizations?.total || 0,
    activeOrganizations: overview.organizations?.active || 0,
    totalEmployees: overview.users?.total || 0,
    todayCheckins: analytics.todayCheckins || 0,
    mrr: analytics.mrr || 0,
    mrrGrowth: analytics.mrrGrowth || 0,
    activeSubscriptions: overview.subscriptions?.total || 0,
    paidSubscriptions: overview.subscriptions?.activePaid || 0,
    churnRate: analytics.churnRate || 0,
    activeSessions: analytics.activeSessions || 0,
    failedLogins: analytics.failedLogins || 0,
    dbConnections: analytics.dbConnections || 0,
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
const growthChartData = computed(() => ({
  labels: superAdminStore.systemAnalytics.growthChart?.labels || ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
  datasets: [{
    label: 'New Organizations',
    borderColor: '#1e293b',
    backgroundColor: 'rgba(30, 41, 59, 0.1)',
    data: superAdminStore.systemAnalytics.growthChart?.data || [12, 19, 15, 25, 22, 32],
    tension: 0.4,
    fill: true,
  }],
}))

const revenueChartData = computed(() => ({
  labels: superAdminStore.systemAnalytics.revenueChart?.labels || ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
  datasets: [{
    label: 'Monthly Revenue',
    backgroundColor: '#eab308',
    borderRadius: 6,
    data: superAdminStore.systemAnalytics.revenueChart?.data || [28500, 31200, 29800, 38900, 42150, 45280],
  }],
}))

const attendanceChartData = computed(() => ({
  labels: superAdminStore.systemAnalytics.attendanceChart?.labels || ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
  datasets: [{
    label: 'Check-ins',
    borderColor: '#059669',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    data: superAdminStore.systemAnalytics.attendanceChart?.data || [3400, 3800, 3950, 4200, 4080, 4156],
    tension: 0.4,
    fill: true,
  }],
}))

const planChartData = computed(() => ({
  labels: superAdminStore.systemAnalytics.planChart?.labels || ['Free', 'Basic', 'Pro', 'Enterprise'],
  datasets: [{
    data: superAdminStore.systemAnalytics.planChart?.data || [28, 39, 35, 16],
    backgroundColor: ['#1e293b', '#eab308', '#059669', '#0ea5e9'],
    borderWidth: 0,
  }],
}))

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
    await Promise.all([
      superAdminStore.fetchSystemOverview(),
      superAdminStore.fetchSystemAnalytics(),
      superAdminStore.fetchAuditLogs(1, 10)
    ])
    chartReady.value = true
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    // Fallback to placeholder data if API fails
    chartReady.value = true
  }
})
</script>
