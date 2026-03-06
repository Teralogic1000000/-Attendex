<template>
  <div v-if="isOpen" data-slot="collapsible-content" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

const collapsible = inject<any>('collapsible')

const isOpen = computed(() => collapsible?.isOpen.value ?? false)
</script>
