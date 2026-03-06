<template>
  <button type="button" data-slot="dropdown-menu-item" class="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground disabled:pointer-events-none disabled:opacity-50" :class="$attrs.class" v-bind="$attrs" @click="handleClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const dropdownMenu = inject<any>('dropdownMenu')

const handleClick = () => {
  dropdownMenu?.close()
}
</script>
