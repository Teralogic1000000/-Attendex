<template>
  <Teleport to="body">
    <div v-if="isOpen" data-slot="sheet-overlay" class="fixed inset-0 z-50 bg-black/50" @click="setOpen(false)" />
    <div v-if="isOpen" data-slot="sheet-content" class="fixed right-0 top-0 z-50 h-screen w-3/4 bg-background shadow-lg" :class="$attrs.class">
      <button
        data-slot="sheet-close"
        class="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100"
        @click="setOpen(false)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4">
          <path d="M18 6l-12 12M6 6l12 12" />
        </svg>
      </button>
      <slot />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

const sheet = inject<any>('sheet')

const isOpen = computed(() => sheet?.isOpen.value ?? false)

const setOpen = (value: boolean) => {
  sheet?.setOpen(value)
}
</script>
