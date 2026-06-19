<template>
  <div
    data-slot="toast"
    role="alert"
    :class="toastClasses"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'destructive'
  open?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  open: true,
})

const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    default: 'border bg-background text-foreground',
    destructive: 'destructive group border-destructive bg-destructive text-destructive-foreground',
  }
  return variants[props.variant] || variants.default
})

const toastClasses = computed(() => {
  const base = 'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all'
  return `${base} ${variantClasses.value} ${props.class || ''}`
})
</script>
