<template>
  <div v-if="isOpen" data-slot="select-content" class="absolute z-50 rounded-md border bg-popover text-popover-foreground shadow-md" :class="$attrs.class">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

const select = inject<any>('select')

const isOpen = computed(() => select?.isOpen.value ?? false)
</script>
