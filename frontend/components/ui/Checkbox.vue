<template>
  <div class="flex items-center gap-2">
    <div
      data-slot="checkbox"
      role="checkbox"
      :aria-checked="modelValue"
      :class="checkboxClasses"
      @click="$emit('update:modelValue', !modelValue)"
      @keydown.enter="$emit('update:modelValue', !modelValue)"
      @keydown.space.prevent="$emit('update:modelValue', !modelValue)"
      tabindex="0"
    >
      <svg
        v-if="modelValue"
        data-slot="checkbox-indicator"
        class="flex items-center justify-center text-current transition-none size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="4"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: boolean
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const checkboxClasses = computed(() => {
  const base = 'peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none disabled:cursor-not-allowed disabled:opacity-50'
  const checkedClass = props.modelValue ? 'bg-primary text-primary-foreground border-primary' : ''
  const disabledClass = props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
  return `${base} ${checkedClass} ${disabledClass} ${props.class || ''}`
})
</script>
