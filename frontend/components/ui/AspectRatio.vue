<template>
  <div
    data-slot="aspect-ratio"
    :style="{ aspectRatio: `${width}/${height}` }"
    class="overflow-hidden"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 16,
  height: 9,
})
</script>
