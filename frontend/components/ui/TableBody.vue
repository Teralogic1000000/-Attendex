<template>
  <tbody data-slot="table-body" class="[&_tr:last-child]:border-0" :class="$attrs.class">
    <slot />
  </tbody>
</template>

<script setup lang="ts">
</script>
