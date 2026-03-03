<template>
  <div>
    <AppHeader title="Organization Dashboard" subtitle="Overview of your organization's attendance and activity" />

    <div class="p-6 flex flex-col gap-6">
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          :value="formatNumber(stats.totalEmployees)"
          :icon="Users"
          color="org"
        />
        <StatCard
          title="Present Today"
          :value="formatNumber(stats.presentToday)"
          :icon="UserCheck"
          color="accent"
        />
        <StatCard
          title="Avg. Hours Today"
          :value="stats.avgHours + 'h'"
          :icon="Clock"
          color="warning"
        />
        <StatCard
          title="Subscription"
          :value="stats.planName"
          :subtitle="stats.planStatus"
          :icon="CreditCard"
          color="org"
        />
      </div>

      <!-- Chart + Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 card p-6">
          <h3 class="text-lg font-semibold text-[var(--dashboard-primary)] mb-4">Attendance This Week</h3>
          <div class="h-72">
            <Bar v-if="chartReady" :data="chartData" :options="chartOptions" />
            <div v-else class="flex h-full items-center justify-center text-slate-400 text-sm">
              Loading chart data...
            </div>
          </div>
        </div>
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-[var(--dashboard-primary)] mb-4">Recent Activity</h3>
          <div class="flex flex-col gap-3">
            <div
              v-for="(item, idx) in recentActivity"
              :key="idx"
              class="flex items-start gap-3 text-sm"
            >
              <div :class="item.dotColor" class="mt-1.5 h-2 w-2 shrink-0 rounded-full" />
              <div class="flex-1">
                <p class="text-slate-700">{{ item.text }}</p>
                <p class="text-xs text-slate-400">{{ item.time }}</p>
              </div>
            </div>
            <div v-if="recentActivity.length === 0" class="text-sm text-slate-400 text-center py-8">
              No recent activity
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import AppHeader from '@/components/common/AppHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import { useUserStore } from '@/stores/user'
import { useAttendanceStore } from '@/stores/attendance'
import { useSubscriptionStore } from '@/stores/subscription'
import { formatNumber, timeAgo } from '@/utils/helpers'
import { Users, UserCheck, Clock, CreditCard } from 'lucide-vue-next'
import dashboardService from '@/services/dashboardService'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const userStore = useUserStore()
const attendanceStore = useAttendanceStore()
const subscriptionStore = useSubscriptionStore()

const chartReady = ref(false)

const stats = ref({
  totalEmployees: 0,
  presentToday: 0,
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
      backgroundColor: '#4F46E5',
      borderRadius: 6,
      data: [0, 0, 0, 0, 0, 0, 0],
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
      grid: { color: '#F1F5F9' },
    },
    x: {
      grid: { display: false },
    },
  },
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
      stats.value.avgHours = userStatsData.value.avgHours || '0.0'
    }

    if (subData.status === 'fulfilled' && subscriptionStore.currentSubscription) {
      stats.value.planName = subscriptionStore.currentSubscription.planName || subscriptionStore.currentSubscription.name || 'Free'
      stats.value.planStatus = subscriptionStore.currentSubscription.status || 'Active'
    }

    // Populate recent activity from org attendance
    if (attendanceStore.orgAttendance && attendanceStore.orgAttendance.length > 0) {
      recentActivity.value = attendanceStore.orgAttendance.slice(0, 6).map((r) => ({
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
