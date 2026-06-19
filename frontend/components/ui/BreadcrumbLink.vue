<template>
  <component
    :is="component"
    data-slot="breadcrumb-link"
    class="hover:text-foreground transition-colors"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  asChild?: boolean
  href?: string
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
})

const component = computed(() => props.asChild ? 'span' : 'a')
</script>
