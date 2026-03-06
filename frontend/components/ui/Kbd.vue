<template>
  <component
    :is="isGroup ? 'div' : 'kbd'"
    :data-slot="isGroup ? 'kbd-group' : 'kbd'"
    :class="kbdClasses"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  group?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  group: false,
})

const isGroup = computed(() => props.group)

const kbdClasses = computed(() => {
  if (props.group) {
    return `inline-flex items-center gap-1 ${props.class || ''}`
  }
  const base = 'bg-muted w-fit text-muted-foreground pointer-events-none inline-flex h-5 min-w-5 items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium select-none [&_svg:not([class*="size-"])]:size-3 [[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10'
  return `${base} ${props.class || ''}`
})
</script>
