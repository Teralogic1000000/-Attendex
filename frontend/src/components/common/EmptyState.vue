<template>
  <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div class="rounded-full bg-slate-100 p-4 mb-4">
      <component :is="icon" class="h-8 w-8 text-slate-400" />
    </div>
    <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
    <p class="mt-1 text-sm text-slate-500 max-w-sm">{{ description }}</p>
    <div v-if="$slots.action" class="mt-6">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
import { Inbox } from 'lucide-vue-next'

defineProps({
  title: { type: String, default: 'No data found' },
  description: { type: String, default: 'There are no records to display at this time.' },
  icon: { type: Object, default: () => Inbox },
})
</script>
