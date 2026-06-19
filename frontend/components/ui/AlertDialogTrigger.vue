<template>
  <button type="button" data-slot="alert-dialog-trigger" v-bind="$attrs" @click="$emit('trigger')">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  trigger: []
}>()
</script>
