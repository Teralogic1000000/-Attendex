<template>
  <td data-slot="table-cell" class="p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]" :class="$attrs.class">
    <slot />
  </td>
</template>

<script setup lang="ts">
</script>
