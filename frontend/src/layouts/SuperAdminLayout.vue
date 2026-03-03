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
import { BarChart3, Building2, Layers, ScrollText } from 'lucide-vue-next'

const collapsed = ref(false)

const navItems = [
  { to: '/superadmin/overview', label: 'Overview', icon: BarChart3 },
  { to: '/superadmin/organizations', label: 'Organizations', icon: Building2 },
  { to: '/superadmin/plans', label: 'Plans', icon: Layers },
  { to: '/superadmin/logs', label: 'System Logs', icon: ScrollText },
]
</script>
