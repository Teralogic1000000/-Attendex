<template>
  <aside
    :class="collapsed ? 'w-16' : 'w-64'"
    class="fixed inset-y-0 left-0 z-30 flex flex-col bg-slate-900 transition-all duration-300"
    :style="sidebarStyle"
  >
    <!-- Logo -->
    <div class="flex h-16 items-center gap-3 px-4 border-b border-slate-800">
      <img
        v-if="orgLogo"
        :src="orgLogo"
        alt="Logo"
        class="org-logo"
      />
      <div v-else class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white font-bold text-sm">
        A
      </div>
      <span v-show="!collapsed" class="text-lg font-bold text-white tracking-tight">TrackTimi</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin">
      <ul class="flex flex-col gap-1">
        <li v-for="item in navItems" :key="item.to">
          <router-link
            :to="item.to"
            :class="[
              isActive(item.to)
                ? 'bg-orange-600 text-white'
                : 'text-slate-300 hover:bg-slate-800',
            ]"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
          >
            <component :is="item.icon" class="h-5 w-5 shrink-0" />
            <span v-show="!collapsed">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- User section -->
    <div class="border-t border-slate-800 p-3">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-sm font-semibold">
          {{ initials }}
        </div>
        <div v-show="!collapsed" class="flex-1 overflow-hidden">
          <p class="truncate text-sm font-medium text-white">{{ fullName }}</p>
          <p class="truncate text-xs text-slate-400">{{ role }}</p>
        </div>
        <button
          v-show="!collapsed"
          @click="handleLogout"
          class="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Logout"
        >
          <LogOut class="h-4 w-4" />
          <span class="sr-only">Logout</span>
        </button>
      </div>
    </div>

    <!-- Collapse toggle -->
    <button
      @click="$emit('toggle')"
      class="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-gray-200 text-dark-900 hover:text-primary-500 transition-colors"
    >
      <ChevronLeft v-if="!collapsed" class="h-3.5 w-3.5" />
      <ChevronRight v-else class="h-3.5 w-3.5" />
      <span class="sr-only">{{ collapsed ? 'Expand sidebar' : 'Collapse sidebar' }}</span>
    </button>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/hooks/useTheme'
import { getInitials } from '@/utils/helpers'
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  navItems: { type: Array, required: true },
  collapsed: { type: Boolean, default: false },
})

defineEmits(['toggle'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { orgLogo } = useTheme()

const fullName = computed(() => authStore.fullName)
const role = computed(() => authStore.userRole)
const initials = computed(() =>
  getInitials(authStore.user?.firstName, authStore.user?.lastName)
)

const sidebarStyle = computed(() => ({
  backgroundColor: `var(--dashboard-primary-dark)`,
  borderRight: `1px solid var(--dashboard-primary)`,
}))

function isActive(path) {
  return route.path.startsWith(path)
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
