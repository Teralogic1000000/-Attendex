<template>
  <div
    data-slot="empty-media"
    :class="emptyMediaClasses"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'icon'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const emptyMediaClasses = computed(() => {
  const base = "flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0"
  const variantClass = props.variant === 'icon'
    ? "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6"
    : 'bg-transparent'
  return `${base} ${variantClass} ${props.class || ''}`
})
</script>
