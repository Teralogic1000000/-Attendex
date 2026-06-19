<template>
  <button
    type="button"
    data-slot="collapsible-trigger"
    @click="toggle"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const collapsible = inject<any>('collapsible')

const toggle = () => {
  collapsible?.toggle()
}
</script>
