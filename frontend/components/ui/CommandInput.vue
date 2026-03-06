<template>
  <input
    type="search"
    data-slot="command-input"
    :class="commandInputClasses"
    placeholder="Search..."
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const commandInputClasses = computed(() => {
  const base = 'flex h-10 w-full rounded-md border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
  return `${base} ${props.class || ''}`
})
</script>
