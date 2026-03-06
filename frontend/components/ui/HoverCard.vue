<template>
  <div data-slot="hover-card" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'

const isOpen = ref(false)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

provide('hoverCard', {
  isOpen,
  open,
  close,
})
</script>
