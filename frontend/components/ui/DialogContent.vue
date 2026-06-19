<template>
  <Teleport to="body">
    <div v-if="isOpen" data-slot="dialog-overlay" class="fixed inset-0 z-50 bg-black/50" @click="setOpen(false)" />
    <div v-if="isOpen" data-slot="dialog-content" class="fixed top-[50%] left-[50%] z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg" :class="$attrs.class">
      <button
        v-if="showCloseButton"
        data-slot="dialog-close"
        class="absolute top-4 right-4 rounded-xs opacity-70 hover:opacity-100"
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

interface Props {
  showCloseButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showCloseButton: true,
})

const dialog = inject<any>('dialog')

const isOpen = computed(() => dialog?.isOpen.value ?? false)

const setOpen = (value: boolean) => {
  dialog?.setOpen(value)
}
</script>
