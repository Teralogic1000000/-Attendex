<template>
    <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-slate-900">Dashboard</h1>
      <p class="text-slate-600 mt-1">{{ greeting }}, {{ userName }}! Here's your TrackTimi overview.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
      <p class="text-slate-600 mt-4">Loading dashboard data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
      <p class="font-medium">{{ error }}</p>
    </div>

    <!-- Statistics Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatisticsCard
        label="Total Users"
        :value="stats.totalUsers"
        :icon="UsersIcon"
        :change="stats.userChange"
        icon-color="text-orange-600"
        icon-bg-color="bg-orange-100"
      />
      <StatisticsCard
        label="Total Departments"
        :value="stats.totalDepartments"
        :icon="DepartmentsIcon"
        :change="0"
        icon-color="text-orange-600"
        icon-bg-color="bg-orange-100"
      />
      <StatisticsCard
        label="Present Today"
        :value="stats.presentToday"
        :icon="CheckIcon"
        :change="stats.presentChange"
        icon-color="text-green-600"
        icon-bg-color="bg-green-100"
      />
      <StatisticsCard
        label="Absent Today"
        :value="stats.absentToday"
        :icon="XIcon"
        :change="stats.absentChange"
        icon-color="text-red-600"
        icon-bg-color="bg-red-100"
      />
    </div>

    <!-- Charts and Tables -->
    <div v-if="!loading && !error" class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Attendance Chart -->
      <div class="lg:col-span-2">
        <AttendanceChart />
      </div>

      <!-- Recent Activities -->
      <div>
        <RecentActivities />
      </div>
    </div>

    <!-- Recent Attendance Table -->
    <div v-if="!loading && !error">
      <RecentAttendance />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import StatisticsCard from '@/components/dashboard/StatisticsCard.vue'
import AttendanceChart from '@/components/dashboard/AttendanceChart.vue'
import RecentAttendance from '@/components/dashboard/RecentAttendance.vue'
import RecentActivities from '@/components/dashboard/RecentActivities.vue'
import dashboardService from '@/services/dashboardService'
import attendanceService from '@/services/attendanceService'

const authStore = useAuthStore()
const loading = ref(true)
const error = ref('')

const stats = ref({
  totalUsers: 0,
  totalDepartments: 0,
  presentToday: 0,
  absentToday: 0,
  userChange: 0,
  presentChange: 0,
  absentChange: 0
})

const userName = computed(() => {
  if (!authStore.user) return 'Admin'
  return `${authStore.user.firstName || ''} ${authStore.user.lastName || ''}`.trim() || 'Admin'
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

// Fetch Dashboard Data
const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''

    // Fetch org analytics (statistics)
    const analyticsData = await dashboardService.getOrgAnalytics()
    if (analyticsData) {
      stats.value.totalUsers = analyticsData.totalUsers || 0
      stats.value.totalDepartments = analyticsData.totalDepartments || 0
      stats.value.presentToday = analyticsData.presentToday || 0
      stats.value.absentToday = analyticsData.absentToday || 0
      stats.value.userChange = analyticsData.userChange || 0
      stats.value.presentChange = analyticsData.presentChange || 0
      stats.value.absentChange = analyticsData.absentChange || 0
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
    error.value = 'Failed to load dashboard data. Please try again.'
    // Set default values if API fails
    stats.value = {
      totalUsers: 0,
      totalDepartments: 0,
      presentToday: 0,
      absentToday: 0,
      userChange: 0,
      presentChange: 0,
      absentChange: 0
    }
  } finally {
    loading.value = false
  }
}

// Icon SVG components
const UsersIcon = {
  template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" /></svg>'
}

const DepartmentsIcon = {
  template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>'
}

const CheckIcon = {
  template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
}

const XIcon = {
  template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l5.5-5.5M5.5 5.5L10 10M10 10l-5.5 5.5" /></svg>'
}

onMounted(() => {
  fetchDashboardData()
})
</script>
