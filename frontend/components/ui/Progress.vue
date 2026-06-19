<template>
  <div
    data-slot="progress"
    role="progressbar"
    :aria-valuenow="value"
    aria-valuemin="0"
    aria-valuemax="100"
    :class="progressClasses"
  >
    <div
      data-slot="progress-indicator"
      class="bg-primary h-full w-full flex-1 transition-all"
      :style="{ transform: `translateX(-${100 - (value || 0)}%)` }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
})

const progressClasses = computed(() => {
  const base = 'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full'
  return `${base} ${props.class || ''}`
})
</script>
