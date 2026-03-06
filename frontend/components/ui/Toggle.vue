<template>
  <button
    type="button"
    data-slot="toggle"
    :class="toggleClasses"
    :aria-pressed="modelValue"
    :disabled="disabled"
    @click="$emit('update:modelValue', !modelValue)"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: boolean
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  variant: 'default',
  size: 'default',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    default: 'bg-transparent',
    outline: 'border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground',
  }
  return variants[props.variant] || variants.default
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    default: 'h-9 px-2 min-w-9',
    sm: 'h-8 px-1.5 min-w-8',
    lg: 'h-10 px-2.5 min-w-10',
  }
  return sizes[props.size] || sizes.default
})

const toggleClasses = computed(() => {
  const base = "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] whitespace-nowrap aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
  const stateClass = props.modelValue ? 'bg-accent text-accent-foreground' : ''
  return `${base} ${variantClasses.value} ${sizeClasses.value} ${stateClass} ${props.class || ''}`
})
</script>
