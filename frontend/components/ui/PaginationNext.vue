<template>
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    class="gap-1 px-2.5 sm:pr-2.5"
    v-bind="$attrs"
  >
    <span class="hidden sm:block">Next</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4">
      <path d="m9 18 6-6-6-6" />
    </svg>
  </PaginationLink>
</template>

<script setup lang="ts">
import PaginationLink from './PaginationLink.vue'
</script>
