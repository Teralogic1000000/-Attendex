<template>
  <div v-if="isOpen" data-slot="accordion-content" class="overflow-hidden text-sm">
    <div class="pt-0 pb-4" :class="$attrs.class">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

interface Props {
  value: string
}

const props = defineProps<Props>()

const accordion = inject<any>('accordion')

const isOpen = computed(() => {
  return Array.isArray(accordion?.openItems.value)
    ? accordion?.openItems.value.includes(props.value)
    : accordion?.openItems.value === props.value
})
</script>
