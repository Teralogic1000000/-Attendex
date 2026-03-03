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
import { LayoutDashboard, Users, CalendarCheck, CreditCard, Settings } from 'lucide-vue-next'

const collapsed = ref(false)

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/admin/subscription', label: 'Subscription', icon: CreditCard },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]
</script>
