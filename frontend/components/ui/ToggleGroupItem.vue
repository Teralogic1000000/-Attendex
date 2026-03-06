<template>
  <button
    type="button"
    data-slot="toggle-group-item"
    :class="itemClasses"
    :aria-pressed="isPressed"
    @click="updateValue(value)"
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

const toggleGroup = inject<any>('toggleGroup')

const isPressed = computed(() => {
  const val = toggleGroup?.modelValue()
  return Array.isArray(val) ? val.includes(props.value) : val === props.value
})

const updateValue = (value: string) => {
  toggleGroup?.updateValue(value)
}

const getVariantClass = () => {
  const variant = toggleGroup?.variant() || 'default'
  const size = toggleGroup?.size() || 'default'
  
  const variantClasses: Record<string, string> = {
    default: 'bg-transparent',
    outline: 'border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground',
  }
  
  const sizeClasses: Record<string, string> = {
    default: 'h-9 px-2 min-w-9',
    sm: 'h-8 px-1.5 min-w-8',
    lg: 'h-10 px-2.5 min-w-10',
  }
  
  return `${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.default}`
}

const itemClasses = computed(() => {
  const base = "inline-flex items-center justify-center gap-2 rounded-none text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] whitespace-nowrap aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-w-0 flex-1 shrink-0 first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10"
  const stateClass = isPressed.value ? 'bg-accent text-accent-foreground' : ''
  const variantClass = toggleGroup?.variant() === 'outline' ? 'border-l-0 first:border-l' : ''
  return `${base} ${getVariantClass()} ${stateClass} ${variantClass} ${props.class || ''}`
})
</script>
