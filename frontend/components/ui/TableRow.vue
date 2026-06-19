<template>
  <tr data-slot="table-row" class="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors" :class="$attrs.class">
    <slot />
  </tr>
</template>

<script setup lang="ts">
</script>
