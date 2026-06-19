<template>
  <div data-slot="context-menu-trigger" @contextmenu.prevent="open" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const contextMenu = inject<any>('contextMenu')

const open = () => {
  contextMenu?.open()
}
</script>
