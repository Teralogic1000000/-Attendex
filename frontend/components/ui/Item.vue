<template>
  <component
    :is="asChild ? 'span' : 'div'"
    role="listitem"
    data-slot="item"
    :class="itemClasses"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'outline' | 'muted'
  size?: 'default' | 'sm'
  asChild?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  asChild: false,
})

const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    default: 'bg-transparent',
    outline: 'border-border',
    muted: 'bg-muted/50',
  }
  return variants[props.variant] || variants.default
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    default: 'p-4 gap-4',
    sm: 'py-3 px-4 gap-2.5',
  }
  return sizes[props.size] || sizes.default
})

const itemClasses = computed(() => {
  const base = 'group/item flex items-center border border-transparent text-sm rounded-md transition-colors [a&]:hover:bg-accent/50 [a&]:transition-colors duration-100 flex-wrap outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
  return `${base} ${variantClasses.value} ${sizeClasses.value} ${props.class || ''}`
})
</script>
