<template>
  <div
    :class="[
      'fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 z-40',
      isOpen ? 'w-64' : 'w-20',
      'lg:relative lg:translate-x-0'
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center justify-between p-6 border-b border-slate-800">
      <div v-if="isOpen" class="flex items-center gap-2">
        <div class="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center font-bold">
          T
        </div>
        <span class="font-bold text-lg">TrackTimi</span>
      </div>
      <button
        v-if="isOpen"
        @click="$emit('toggle')"
        class="lg:hidden p-1 hover:bg-slate-800 rounded transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Navigation Menu -->
    <nav class="mt-8 px-3 space-y-2">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 group"
        :class="{
          'bg-orange-600 text-white': isActive(item.path),
          'text-slate-300 hover:bg-slate-800 hover:text-white': !isActive(item.path)
        }"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span v-if="isOpen" class="text-sm font-medium">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Bottom Settings -->
    <div class="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-800">
      <RouterLink
        to="/admin/settings"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-200"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span v-if="isOpen" class="text-sm font-medium">Settings</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

defineEmits<{
  toggle: []
}>()

const route = useRoute()

const menuItems = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: 'DashboardIcon'
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: 'UsersIcon'
  },
  {
    path: '/admin/departments',
    label: 'Departments',
    icon: 'DepartmentsIcon'
  },
  {
    path: '/admin/shifts',
    label: 'Shifts',
    icon: 'ShiftsIcon'
  },
  {
    path: '/admin/attendance',
    label: 'Attendance',
    icon: 'AttendanceIcon'
  },
  {
    path: '/admin/reports',
    label: 'Reports',
    icon: 'ReportsIcon'
  },
  {
    path: '/admin/settings',
    label: 'Settings',
    icon: 'SettingsIcon'
  }
]

const isActive = (path: string) => {
  return route.path === path
}

// Icon components
const DashboardIcon = computed(() => ({
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-3m2-2l6.3-6.3a1 1 0 011.4 0l9.6 9.6a1 1 0 01-1.4 1.4L16 7.4m0 0l-2.3 2.3m0 0l3 3m0 0l3 3" /></svg>'
}))

const UsersIcon = computed(() => ({
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" /></svg>'
}))

const DepartmentsIcon = computed(() => ({
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>'
}))

const ShiftsIcon = computed(() => ({
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
}))

const AttendanceIcon = computed(() => ({
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
}))

const ReportsIcon = computed(() => ({
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>'
}))

const SettingsIcon = computed(() => ({
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
}))
</script>
