<template>
  <div class="group/toggle-group flex w-fit items-center rounded-md" :class="variantOutlineClass" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'

interface Props {
  modelValue?: string | string[]
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  type?: 'single' | 'multiple'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  variant: 'default',
  size: 'default',
  type: 'single',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

const variantOutlineClass = computed(() => {
  return props.variant === 'outline' ? 'shadow-xs' : ''
})

provide('toggleGroup', {
  variant: () => props.variant,
  size: () => props.size,
  modelValue: () => props.modelValue,
  updateValue: (value: string) => {
    if (props.type === 'single') {
      emit('update:modelValue', value)
    } else {
      const current = Array.isArray(props.modelValue) ? props.modelValue : []
      if (current.includes(value)) {
        emit('update:modelValue', current.filter(v => v !== value))
      } else {
        emit('update:modelValue', [...current, value])
      }
    }
  },
})
</script>
