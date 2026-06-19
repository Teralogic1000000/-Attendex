<template>
  <button type="button" data-slot="alert-dialog-cancel" @click="$emit('cancel')" v-bind="$attrs">
    <slot>Cancel</slot>
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  cancel: []
}>()
</script>
