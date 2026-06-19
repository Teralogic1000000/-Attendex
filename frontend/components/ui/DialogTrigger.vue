<template>
  <button type="button" data-slot="dialog-trigger" @click="setOpen(true)" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const dialog = inject<any>('dialog')

const setOpen = (value: boolean) => {
  dialog?.setOpen(value)
}
</script>
