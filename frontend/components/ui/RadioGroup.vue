<template>
  <div data-slot="radio-group" role="radiogroup" class="grid gap-3" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'

interface Props {
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

provide('radioGroup', {
  modelValue: () => props.modelValue,
  updateValue: (value: string) => emit('update:modelValue', value),
})
</script>
