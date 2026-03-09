<template>
  <div class="min-h-screen" :class="{'bg-[var(--dashboard-primary-light)]': true}">
    <AppSidebar :navItems="navItems" :collapsed="collapsed" @toggle="collapsed = !collapsed" />
    <div :class="collapsed ? 'ml-16' : 'ml-64'" class="transition-all duration-300">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import { LayoutDashboard, Building2, TrendingUp, BarChart3, Activity, AlertCircle, Settings } from 'lucide-vue-next'

const collapsed = ref(false)

const navItems = [
  { to: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/superadmin/organizations', label: 'Organizations', icon: Building2 },
  { to: '/superadmin/revenue', label: 'Revenue', icon: TrendingUp },
  { to: '/superadmin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/superadmin/monitoring', label: 'Monitoring', icon: Activity },
  { to: '/superadmin/audit-logs', label: 'Audit Logs', icon: AlertCircle },
  { to: '/superadmin/settings', label: 'Settings', icon: Settings },
]
</script>
