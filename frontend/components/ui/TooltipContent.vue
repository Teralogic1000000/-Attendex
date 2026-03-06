<template>
  <div v-if="isOpen" data-slot="tooltip-content" class="absolute z-50 rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md" :class="$attrs.class">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

const tooltip = inject<any>('tooltip')

const isOpen = computed(() => tooltip?.isOpen.value ?? false)
</script>
