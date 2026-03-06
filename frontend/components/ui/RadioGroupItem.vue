<template>
  <label class="flex items-center gap-2 cursor-pointer">
    <input
      type="radio"
      :value="value"
      :checked="modelValue === value"
      :disabled="disabled"
      :class="radioClasses"
      @change="$emit('update:modelValue', value)"
    />
    <slot />
  </label>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

interface Props {
  modelValue?: string
  value: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const radioClasses = computed(() => {
  const base = 'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
  return `${base} ${props.class || ''}`
})
</script>
