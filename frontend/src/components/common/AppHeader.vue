<template>
  <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-black px-6">
    <div>
      <h1 class="text-lg font-semibold text-slate-900">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-4">
      <slot name="actions" />
      <div class="relative" ref="dropdownRef">
        <button
          @click="showDropdown = !showDropdown"
          class="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors"
        >
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm font-semibold">
            {{ initials }}
          </div>
          <ChevronDown class="h-4 w-4 text-slate-500" />
        </button>
        <transition name="dropdown">
          <div
            v-if="showDropdown"
            class="absolute right-0 mt-2 w-48 rounded-lg bg-white py-1.5 shadow-lg ring-1 ring-slate-200"
          >
            <router-link
              :to="profileLink"
              @click="showDropdown = false"
              class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <User class="h-4 w-4" />
              Profile
            </router-link>
            <hr class="my-1 border-slate-100" />
            <button
              @click="handleLogout"
              class="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut class="h-4 w-4" />
              Logout
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { getInitials } from '@/utils/helpers'
import { ChevronDown, User, LogOut } from 'lucide-vue-next'
import { ROLES } from '@/utils/constants'

defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: null },
})

const router = useRouter()
const authStore = useAuthStore()
const showDropdown = ref(false)
const dropdownRef = ref(null)

onClickOutside(dropdownRef, () => {
  showDropdown.value = false
})

const initials = computed(() =>
  getInitials(authStore.user?.firstName, authStore.user?.lastName)
)

const profileLink = computed(() => {
  const role = authStore.userRole
  if (role === ROLES.EMPLOYEE) return '/employee/profile'
  if (role === ROLES.ORG_ADMIN) return '/admin/settings'
  return '/superadmin/overview'
})

function handleLogout() {
  showDropdown.value = false
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dropdown-enter-active {
  transition: all 0.15s ease-out;
}
.dropdown-leave-active {
  transition: all 0.1s ease-in;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
