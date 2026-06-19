<template>
  <div data-slot="toast-provider">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'

interface Props {
}

defineProps<Props>()

const toasts = ref<any[]>([])

provide('toastProvider', {
  toasts,
  addToast: (toast: any) => {
    toasts.value.push(toast)
  },
  removeToast: (id: string) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  },
})
</script>
