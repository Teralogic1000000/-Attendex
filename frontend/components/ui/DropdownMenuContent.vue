<template>
  <div v-if="isOpen" data-slot="dropdown-menu-content" class="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md" :class="$attrs.class">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

const dropdownMenu = inject<any>('dropdownMenu')

const isOpen = computed(() => dropdownMenu?.isOpen.value ?? false)
</script>
