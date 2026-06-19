<template>
  <div v-if="isOpen" data-slot="hover-card-content" class="absolute z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md" :class="$attrs.class">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

const hoverCard = inject<any>('hoverCard')

const isOpen = computed(() => hoverCard?.isOpen.value ?? false)
</script>
