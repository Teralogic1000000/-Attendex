<template>
  <button
    type="button"
    data-slot="tabs-trigger"
    :class="triggerClasses"
    @click="updateTab(value)"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

interface Props {
  value: string
  class?: string
}

const props = defineProps<Props>()

const tabs = inject<any>('tabs')

const isActive = computed(() => tabs?.activeTab.value === props.value)

const updateTab = (value: string) => {
  tabs?.updateTab(value)
}

const triggerClasses = computed(() => {
  const base = "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
  const activeClass = isActive.value ? 'bg-background dark:text-foreground border-input dark:bg-input/30 shadow-sm' : ''
  return `${base} ${activeClass} ${props.class || ''}`
})
</script>
