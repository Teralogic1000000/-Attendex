<template>
  <div
    data-slot="empty"
    :class="emptyClasses"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const emptyClasses = computed(() => {
  const base = 'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12'
  return `${base} ${props.class || ''}`
})
</script>
