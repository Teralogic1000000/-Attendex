<template>
  <div
    data-slot="separator"
    role="separator"
    :class="separatorClasses"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  orientation?: 'horizontal' | 'vertical'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
})

const separatorClasses = computed(() => {
  const base = 'bg-border shrink-0'
  const orientationClass = props.orientation === 'horizontal'
    ? 'h-px w-full'
    : 'h-full w-px'
  return `${base} ${orientationClass} ${props.class || ''}`
})
</script>
