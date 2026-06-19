<template>
  <button type="button" data-slot="dropdown-menu-trigger" @click="toggle" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const dropdownMenu = inject<any>('dropdownMenu')

const toggle = () => {
  dropdownMenu?.toggle()
}
</script>
