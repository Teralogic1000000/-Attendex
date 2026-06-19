<template>
  <div data-slot="sheet" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'

const isOpen = ref(false)

const setOpen = (value: boolean) => {
  isOpen.value = value
}

provide('sheet', {
  isOpen,
  setOpen,
})
</script>
