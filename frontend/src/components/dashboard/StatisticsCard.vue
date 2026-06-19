<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-orange-400 transition-all duration-300">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-slate-600 mb-2">{{ label }}</p>
        <h3 class="text-3xl font-bold text-slate-900">{{ value }}</h3>
        <p v-if="change" :class="['text-xs font-medium mt-2', changePositive ? 'text-green-600' : 'text-red-600']">
          <span>{{ changePositive ? '↑' : '↓' }} {{ Math.abs(change) }}% from last month</span>
        </p>
      </div>
      <div :class="['p-3 rounded-lg', iconBgColor]">
        <component :is="icon" :class="['w-6 h-6', iconColor]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: number | string
  icon: any
  change?: number
  iconColor?: string
  iconBgColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'text-blue-600',
  iconBgColor: 'bg-blue-100'
})

const changePositive = computed(() => {
  return props.change ? props.change >= 0 : true
})
</script>
