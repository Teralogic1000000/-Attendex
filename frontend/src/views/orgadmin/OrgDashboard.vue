<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div :class="['fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full']">
      <div class="flex items-center justify-center h-16 px-4 bg-primary-600">
        <h1 class="text-xl font-bold text-white">Attendex</h1>
      </div>
      <nav class="mt-8">
        <div class="px-4">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dashboard</p>
          <ul class="mt-2 space-y-1">
            <li>
              <a href="#" class="flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg">
                <Home class="w-5 h-5 mr-3" />
                Overview
              </a>
            </li>
          </ul>
        </div>
        <div class="px-4 mt-8">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</p>
          <ul class="mt-2 space-y-1">
            <li>
              <router-link to="/admin/users" class="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                <Users class="w-5 h-5 mr-3" />
                Employees
              </router-link>
            </li>
            <li>
              <router-link to="/admin/attendance" class="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                <Calendar class="w-5 h-5 mr-3" />
                Attendance
              </router-link>
            </li>
            <li>
              <router-link to="/admin/reports" class="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                <BarChart3 class="w-5 h-5 mr-3" />
                Reports
              </router-link>
            </li>
          </ul>
        </div>
        <div class="px-4 mt-8">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</p>
          <ul class="mt-2 space-y-1">
            <li>
              <router-link to="/admin/settings" class="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings class="w-5 h-5 mr-3" />
                Organization
              </router-link>
            </li>
            <li>
              <router-link to="/admin/subscription" class="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                <CreditCard class="w-5 h-5 mr-3" />
                Subscription
              </router-link>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Navigation -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center">
            <button @click="sidebarOpen = !sidebarOpen" class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <Menu class="w-6 h-6" />
            </button>
            <div class="ml-4 lg:ml-0">
              <h2 class="text-lg font-semibold text-gray-900">{{ orgName }}</h2>
              <p class="text-sm text-gray-500">Organization Dashboard</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Subscription Status -->
            <div class="hidden md:flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-100 text-accent-800">
              <Crown class="w-4 h-4 mr-1" />
              {{ stats.planName }}
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
              <button @click="profileMenuOpen = !profileMenuOpen" class="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                  {{ userInitials }}
                </div>
                <ChevronDown class="w-4 h-4" />
              </button>
              <div v-if="profileMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <router-link to="/admin/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</router-link>
                <router-link to="/admin/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</router-link>
                <a href="#" @click="logout" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Dashboard Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-7xl mx-auto space-y-6">
          <!-- KPI Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="p-2 bg-primary-100 rounded-lg">
                  <Users class="w-6 h-6 text-primary-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Employees</p>
                  <p class="text-2xl font-bold text-gray-900">{{ formatNumber(stats.totalEmployees) }}</p>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="p-2 bg-accent-100 rounded-lg">
                  <UserCheck class="w-6 h-6 text-accent-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Present Today</p>
                  <p class="text-2xl font-bold text-gray-900">{{ formatNumber(stats.presentToday) }}</p>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="p-2 bg-danger-100 rounded-lg">
                  <UserX class="w-6 h-6 text-danger-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Absent Today</p>
                  <p class="text-2xl font-bold text-gray-900">{{ formatNumber(stats.absentToday) }}</p>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="p-2 bg-warning-100 rounded-lg">
                  <Clock class="w-6 h-6 text-warning-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Late Check-ins</p>
                  <p class="text-2xl font-bold text-gray-900">{{ formatNumber(stats.lateCheckins) }}</p>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="p-2 bg-secondary-100 rounded-lg">
                  <Briefcase class="w-6 h-6 text-secondary-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Active Projects</p>
                  <p class="text-2xl font-bold text-gray-900">{{ formatNumber(stats.activeProjects) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Real-time Attendance Status -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Real-time Attendance Status</h3>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
                  <span class="text-sm text-gray-500">Live</span>
                </div>
              </div>
              <div class="h-64">
                <Line v-if="chartReady" :data="realtimeChartData" :options="realtimeChartOptions" />
                <div v-else class="flex h-full items-center justify-center text-gray-400 text-sm">
                  Loading chart data...
                </div>
              </div>
            </div>

            <!-- Weekly Attendance Trend -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance Trend</h3>
              <div class="h-64">
                <Bar v-if="chartReady" :data="chartData" :options="chartOptions" />
                <div v-else class="flex h-full items-center justify-center text-gray-400 text-sm">
                  Loading chart data...
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Feed and Quick Actions -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Today's Check-in Activity -->
            <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Today's Check-in Activity</h3>
              <div class="space-y-4 max-h-96 overflow-y-auto">
                <div v-for="(item, idx) in recentActivity" :key="idx" class="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                  <div :class="['w-2 h-2 rounded-full', item.dotColor === 'bg-accent-500' ? 'bg-accent-500' : 'bg-danger-500']"></div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ item.text }}</p>
                    <p class="text-xs text-gray-500">{{ item.time }}</p>
                  </div>
                </div>
                <div v-if="recentActivity.length === 0" class="text-center py-8 text-gray-500">
                  <Calendar class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No activity today</p>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div class="space-y-3">
                <button class="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  <UserPlus class="w-5 h-5 mr-2" />
                  Add Employee
                </button>
                <button class="w-full flex items-center justify-center px-4 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors">
                  <FileText class="w-5 h-5 mr-2" />
                  Generate Report
                </button>
                <button class="w-full flex items-center justify-center px-4 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors">
                  <QrCode class="w-5 h-5 mr-2" />
                  Create QR Code
                </button>
                <button class="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <MapPin class="w-5 h-5 mr-2" />
                  Create Geofence
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Mobile Overlay -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useUserStore } from '@/stores/user'
import { useAttendanceStore } from '@/stores/attendance'
import { useSubscriptionStore } from '@/stores/subscription'
import { formatNumber, timeAgo } from '@/utils/helpers'
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Briefcase,
  Home,
  Calendar,
  BarChart3,
  Settings,
  CreditCard,
  Menu,
  Bell,
  ChevronDown,
  Crown,
  UserPlus,
  FileText,
  QrCode,
  MapPin,
} from 'lucide-vue-next'
import dashboardService from '@/services/dashboardService'
import { useAuthStore } from '@/stores/auth'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

const userStore = useUserStore()
const attendanceStore = useAttendanceStore()
const subscriptionStore = useSubscriptionStore()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const profileMenuOpen = ref(false)
const chartReady = ref(false)

const orgName = computed(() => {
  return authStore.user?.organization?.name || 'Organization'
})

const userInitials = computed(() => {
  const user = authStore.user
  if (user?.firstName && user?.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }
  return user?.email?.[0]?.toUpperCase() || 'U'
})

const stats = ref({
  totalEmployees: 0,
  presentToday: 0,
  absentToday: 0,
  lateCheckins: 0,
  activeProjects: 0,
  avgHours: '0.0',
  planName: 'Free',
  planStatus: 'Active',
})

const recentActivity = ref([])

const chartData = ref({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Employees Present',
      backgroundColor: '#1e293b',
      borderRadius: 6,
      data: [0, 0, 0, 0, 0, 0, 0],
    },
  ],
})

const realtimeChartData = ref({
  labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
  datasets: [
    {
      label: 'Check-ins',
      borderColor: '#eab308',
      backgroundColor: 'rgba(234, 179, 8, 0.1)',
      data: [2, 5, 15, 25, 18, 8],
      tension: 0.4,
      fill: true,
    },
  ],
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

const realtimeChartOptions = {
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
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6,
    },
  },
}

const logout = () => {
  authStore.logout()
}

onMounted(async () => {
  try {
    const [userStatsData, subData, attendanceData] = await Promise.allSettled([
      userStore.fetchStats(),
      subscriptionStore.fetchCurrentSubscription(),
      attendanceStore.fetchOrgAttendance(),
    ])

    if (userStatsData.status === 'fulfilled' && userStatsData.value) {
      stats.value.totalEmployees = userStatsData.value.totalEmployees || userStatsData.value.totalUsers || 0
      stats.value.presentToday = userStatsData.value.presentToday || 0
      stats.value.absentToday = (userStatsData.value.totalEmployees || 0) - (userStatsData.value.presentToday || 0)
      stats.value.lateCheckins = userStatsData.value.lateCheckins || 0
      stats.value.activeProjects = userStatsData.value.activeProjects || 0
      stats.value.avgHours = userStatsData.value.avgHours || '0.0'
    }

    if (subData.status === 'fulfilled' && subscriptionStore.currentSubscription) {
      stats.value.planName = subscriptionStore.currentSubscription.planName || subscriptionStore.currentSubscription.name || 'Free'
      stats.value.planStatus = subscriptionStore.currentSubscription.status || 'Active'
    }

    // Populate recent activity from org attendance
    if (attendanceStore.orgAttendance && attendanceStore.orgAttendance.length > 0) {
      recentActivity.value = attendanceStore.orgAttendance.slice(0, 10).map((r) => ({
        text: `${r.firstName || r.user_name || 'Employee'} ${r.checkOut || r.check_out ? 'checked out' : 'checked in'}`,
        time: timeAgo(r.checkOut || r.check_out || r.checkIn || r.check_in),
        dotColor: r.checkOut || r.check_out ? 'bg-danger-500' : 'bg-accent-500',
      }))
    }

    // Load analytics from backend
    try {
      const analytics = await dashboardService.getOrgAnalytics()
      if (analytics && analytics.weekly) {
        chartData.value.labels = analytics.weekly.map((d) => {
          const dt = new Date(d.date)
          return dt.toLocaleDateString(undefined, { weekday: 'short' })
        })
        chartData.value.datasets[0].data = analytics.weekly.map((d) => d.attendanceCount)
      }
    } catch (e) {
      console.error('Failed to load analytics:', e)
    } finally {
      chartReady.value = true
    }
  } catch (err) {
    console.error('Dashboard data loading error:', err)
    chartReady.value = true
  }
})
</script>
