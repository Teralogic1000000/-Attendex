<template>
  <button type="button" data-slot="tooltip-trigger" @mouseenter="open" @mouseleave="close" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const tooltip = inject<any>('tooltip')

const open = () => {
  tooltip?.open()
}

const close = () => {
  tooltip?.close()
}
</script>
