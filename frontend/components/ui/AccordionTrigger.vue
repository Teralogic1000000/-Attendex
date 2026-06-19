<template>
  <div class="flex">
    <button
      type="button"
      data-slot="accordion-trigger"
      :class="triggerClasses"
      @click="toggleItemOpen"
      v-bind="$attrs"
    >
      <slot />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

interface Props {
  value: string
  class?: string
}

const props = defineProps<Props>()

const accordion = inject<any>('accordion')

const isOpen = computed(() => {
  return Array.isArray(accordion?.openItems.value)
    ? accordion?.openItems.value.includes(props.value)
    : accordion?.openItems.value === props.value
})

const toggleItemOpen = () => {
  accordion?.toggleItem(props.value)
}

const triggerClasses = computed(() => {
  const base = 'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50'
  return `${base} ${props.class || ''}`
})
</script>
