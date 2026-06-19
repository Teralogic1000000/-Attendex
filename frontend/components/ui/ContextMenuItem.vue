<template>
  <button type="button" data-slot="context-menu-item" class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" :class="$attrs.class" v-bind="$attrs" @click="handleClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const contextMenu = inject<any>('contextMenu')

const handleClick = () => {
  contextMenu?.close()
}
</script>
