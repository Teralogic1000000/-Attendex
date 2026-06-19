<template>
  <div v-if="isOpen" data-slot="context-menu-content" class="fixed z-50 rounded-md border bg-popover p-1 text-popover-foreground shadow-md" :class="$attrs.class" @mouseleave="close">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

const contextMenu = inject<any>('contextMenu')

const isOpen = computed(() => contextMenu?.isOpen.value ?? false)

const close = () => {
  contextMenu?.close()
}
</script>
