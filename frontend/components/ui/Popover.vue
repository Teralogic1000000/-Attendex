<template>
  <div data-slot="popover" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

provide('popover', {
  isOpen,
  toggle,
  close,
})
</script>
