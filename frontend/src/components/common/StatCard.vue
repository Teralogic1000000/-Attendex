<template>
  <div class="card p-6">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-slate-500">{{ title }}</p>
        <p class="mt-2 text-3xl font-bold tracking-tight text-slate-900">{{ value }}</p>
        <p v-if="subtitle" class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
      </div>
      <div :class="iconBgClass" class="rounded-lg p-3">
        <component :is="icon" :class="iconColorClass" class="h-6 w-6" />
      </div>
    </div>
    <div v-if="change != null" class="mt-4 flex items-center gap-1.5 text-sm">
      <TrendingUp v-if="change >= 0" class="h-4 w-4 text-accent-600" />
      <TrendingDown v-else class="h-4 w-4 text-danger-600" />
      <span :class="change >= 0 ? 'text-accent-600' : 'text-danger-600'" class="font-medium">
        {{ Math.abs(change) }}%
      </span>
      <span class="text-slate-500">vs last period</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  subtitle: { type: String, default: null },
  icon: { type: Object, required: true },
  // color may be 'primary', 'accent', 'warning', 'danger',
  // or 'org' to use the organization's primary theme
  color: { type: String, default: 'primary' },
  change: { type: Number, default: null },
})

const iconBgClass = computed(() => {
  // if org theme requested, use CSS variable classes
  if (props.color === 'org') {
    return 'bg-[var(--org-primary-light)]'
  }
  const colors = {
    primary: 'bg-primary-50',
    accent: 'bg-accent-50',
    warning: 'bg-warning-50',
    danger: 'bg-danger-50',
  }
  return colors[props.color] || colors.primary
})

const iconColorClass = computed(() => {
  if (props.color === 'org') {
    return 'text-[var(--org-primary)]'
  }
  const colors = {
    primary: 'text-primary-600',
    accent: 'text-accent-600',
    warning: 'text-warning-600',
    danger: 'text-danger-600',
  }
  return colors[props.color] || colors.primary
})
</script>
