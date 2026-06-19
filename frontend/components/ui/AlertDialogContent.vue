<template>
  <div data-slot="alert-dialog-content" class="fixed top-[50%] left-[50%] z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg" :class="$attrs.class">
    <slot />
  </div>
</template>

<script setup lang="ts">
</script>
