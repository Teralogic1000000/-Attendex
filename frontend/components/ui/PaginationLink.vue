<template>
  <a
    data-slot="pagination-link"
    :data-active="isActive"
    :aria-current="isActive ? 'page' : undefined"
    :class="linkClasses"
    v-bind="$attrs"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isActive?: boolean
  size?: 'icon' | 'default' | 'sm' | 'lg'
  href?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  size: 'icon',
})

const variantClasses = computed(() => {
  return props.isActive
    ? 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground'
    : 'hover:bg-accent hover:text-accent-foreground'
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    icon: 'size-9',
    default: 'h-9 px-4 py-2',
    sm: 'h-8 px-3',
    lg: 'h-10 px-6',
  }
  return sizes[props.size] || sizes.icon
})

const linkClasses = computed(() => {
  const base = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
  return `${base} ${variantClasses.value} ${sizeClasses.value} ${props.class || ''}`
})
</script>
