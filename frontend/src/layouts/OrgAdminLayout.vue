<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <AppSidebar :navItems="navItems" :collapsed="collapsed" @toggle="collapsed = !collapsed" />
    <div :class="collapsed ? 'ml-16' : 'ml-64'" class="transition-all duration-300 flex flex-col flex-1">
      <AppHeader title="Dashboard" subtitle="" />
      <div class="flex-1 p-6 md:p-8 bg-gray-50">
        <router-view />
      </div>
      <AppFooter />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
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
