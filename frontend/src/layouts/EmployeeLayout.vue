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
import { LayoutDashboard, Clock, UserCircle } from 'lucide-vue-next'

const collapsed = ref(false)

const navItems = [
  { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employee/history', label: 'Attendance History', icon: Clock },
  { to: '/employee/profile', label: 'Profile', icon: UserCircle },
]
</script>
