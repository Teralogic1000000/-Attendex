<template>
  <div v-if="isOpen" data-slot="popover-content" class="absolute z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md" :class="$attrs.class">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

const popover = inject<any>('popover')

const isOpen = computed(() => popover?.isOpen.value ?? false)
</script>
