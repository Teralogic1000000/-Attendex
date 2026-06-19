<template>
  <div data-slot="context-menu" v-bind="$attrs">
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

provide('contextMenu', {
  isOpen,
  open,
  close,
})
</script>
