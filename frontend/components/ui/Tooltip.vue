<template>
  <div data-slot="tooltip" v-bind="$attrs">
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

provide('tooltip', {
  isOpen,
  open,
  close,
})
</script>
