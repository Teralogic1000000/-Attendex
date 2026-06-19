<template>
  <input
    type="text"
    data-slot="input-otp"
    maxlength="1"
    inputmode="numeric"
    class="size-9 text-center text-sm font-semibold border border-input rounded-md focus:ring-2 focus:ring-ring outline-none"
    :class="$attrs.class"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
</script>
