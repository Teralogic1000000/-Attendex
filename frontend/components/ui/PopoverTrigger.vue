<template>
  <button type="button" data-slot="popover-trigger" @click="toggle" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const popover = inject<any>('popover')

const toggle = () => {
  popover?.toggle()
}
</script>
