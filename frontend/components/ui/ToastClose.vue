<template>
  <button
    type="button"
    data-slot="toast-close"
    class="ring-offset-background focus:ring-ring absolute -top-2 -right-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden group-hover:opacity-100 [&_svg]:size-4"
    @click="handleClose"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 6l-12 12M6 6l12 12" />
    </svg>
    <span class="sr-only">Close</span>
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()

const handleClose = () => {
  emit('close')
}
</script>
