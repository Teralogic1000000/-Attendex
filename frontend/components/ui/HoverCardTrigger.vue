<template>
  <div type="button" data-slot="hover-card-trigger" @mouseenter="open" @mouseleave="close" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const hoverCard = inject<any>('hoverCard')

const open = () => {
  hoverCard?.open()
}

const close = () => {
  hoverCard?.close()
}
</script>
