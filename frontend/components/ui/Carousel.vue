<template>
  <div data-slot="carousel" class="relative" :class="$attrs.class">
    <div class="flex overflow-x-auto">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
