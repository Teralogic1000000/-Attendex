<template>
  <div data-slot="command" :class="commandClasses" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const commandClasses = computed(() => {
  const base = 'overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md'
  return `${base} ${props.class || ''}`
})
</script>
