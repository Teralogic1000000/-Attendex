<template>
  <button type="button" data-slot="select-trigger" class="relative flex items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground hover:bg-accent focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" @click="toggle" v-bind="$attrs">
    <slot />
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 opacity-50">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const select = inject<any>('select')

const toggle = () => {
  select.isOpen.value = !select.isOpen.value
}
</script>
