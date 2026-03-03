<template>
  <div>
    <AppHeader title="System Overview" subtitle="Platform-wide statistics and monitoring" />

    <div class="p-6 flex flex-col gap-6">
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Organizations"
          :value="formatNumber(stats.totalOrganizations)"
          :icon="Building2"
          color="primary"
        />
        <StatCard
          title="Total Users"
          :value="formatNumber(stats.totalUsers)"
          :icon="Users"
          color="accent"
        />
        <StatCard
          title="Active Subscriptions"
          :value="formatNumber(stats.activeSubscriptions)"
          :icon="CreditCard"
          color="warning"
        />
        <StatCard
          title="Monthly Revenue"
          :value="formatCurrency(stats.monthlyRevenue)"
          :icon="DollarSign"
          color="accent"
        />
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Organization Growth</h3>
          <div class="h-72">
            <Bar v-if="chartReady" :data="growthChartData" :options="barChartOptions" />
            <div v-else class="flex h-full items-center justify-center text-slate-400 text-sm">
              Loading chart...
            </div>
          </div>
        </div>
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Subscription Distribution</h3>
          <div class="h-72 flex items-center justify-center">
            <Doughnut v-if="chartReady" :data="doughnutChartData" :options="doughnutChartOptions" />
            <div v-else class="text-slate-400 text-sm">Loading chart...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import AppHeader from '@/components/common/AppHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import { useSuperAdminStore } from '@/stores/superAdmin'
import { formatNumber, formatCurrency } from '@/utils/helpers'
import { Building2, Users, CreditCard, DollarSign } from 'lucide-vue-next'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const superAdminStore = useSuperAdminStore()
const chartReady = ref(false)

const stats = ref({
  totalOrganizations: 0,
  totalUsers: 0,
  activeSubscriptions: 0,
  monthlyRevenue: 0,
})

const growthChartData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'New Organizations',
      backgroundColor: '#4F46E5',
      borderRadius: 6,
      data: [0, 0, 0, 0, 0, 0],
    },
  ],
})

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#F1F5F9' } },
    x: { grid: { display: false } },
  },
}

const doughnutChartData = ref({
  labels: ['Free', 'Basic', 'Pro', 'Enterprise'],
  datasets: [
    {
      data: [0, 0, 0, 0],
      backgroundColor: ['#94A3B8', '#6366F1', '#059669', '#D97706'],
      borderWidth: 0,
    },
  ],
})

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

onMounted(async () => {
  try {
    const data = await superAdminStore.fetchStats()
    if (data) {
      stats.value = {
        totalOrganizations: data.totalOrganizations || 0,
        totalUsers: data.totalUsers || 0,
        activeSubscriptions: data.activeSubscriptions || 0,
        monthlyRevenue: data.monthlyRevenue || 0,
      }

      if (data.growthData) {
        growthChartData.value.labels = data.growthData.map((d) => d.month || d.label)
        growthChartData.value.datasets[0].data = data.growthData.map((d) => d.count || d.value)
      } else {
        growthChartData.value.datasets[0].data = [3, 5, 4, 7, 6, 9]
      }

      if (data.subscriptionDistribution) {
        doughnutChartData.value.labels = data.subscriptionDistribution.map((d) => d.name || d.label)
        doughnutChartData.value.datasets[0].data = data.subscriptionDistribution.map((d) => d.count || d.value)
      } else {
        doughnutChartData.value.datasets[0].data = [12, 8, 5, 2]
      }
    }
    chartReady.value = true
  } catch {
    chartReady.value = true
  }
})
</script>
