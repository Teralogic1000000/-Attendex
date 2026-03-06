<template>
  <label data-slot="label" :class="labelClasses" v-bind="$attrs">
    <slot />
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const labelClasses = computed(() => {
  const base = 'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50'
  return `${base} ${props.class || ''}`
})
</script>
