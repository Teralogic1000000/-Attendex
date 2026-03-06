<template>
  <button type="button" data-slot="sheet-trigger" @click="setOpen(true)" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const sheet = inject<any>('sheet')

const setOpen = (value: boolean) => {
  sheet?.setOpen(value)
}
</script>
