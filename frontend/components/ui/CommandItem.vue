<template>
  <button type="button" data-slot="command-item" class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" :class="$attrs.class" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup lang="ts">
</script>
