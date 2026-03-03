<template>
  <transition name="fade">
    <div
      v-if="isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm"
    >
      <div class="flex flex-col items-center gap-3">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
        <p class="text-sm font-medium text-slate-700">Loading...</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()
const isLoading = computed(() => loadingStore.isLoading)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
