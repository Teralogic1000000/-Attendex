<template>
  <form :class="$attrs.class" v-bind="$attrs">
    <slot />
  </form>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'

interface Props {
  modelValue?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  submit: [value: Record<string, any>]
}>()

const formState = ref(props.modelValue)

const updateField = (fieldName: string, value: any) => {
  formState.value[fieldName] = value
  emit('update:modelValue', formState.value)
}

const getFieldState = (fieldName: string) => {
  return {
    value: formState.value[fieldName],
    error: null,
    isDirty: false,
    isTouched: false,
  }
}

provide('form', {
  formState,
  updateField,
  getFieldState,
})
</script>
