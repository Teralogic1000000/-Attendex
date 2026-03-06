<template>
  <span
    data-slot="breadcrumb-page"
    role="link"
    aria-disabled="true"
    aria-current="page"
    class="text-foreground font-normal"
    :class="$attrs.class"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
</script>
