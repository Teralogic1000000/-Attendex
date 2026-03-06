<template>
  <div data-slot="select" v-bind="$attrs">
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

const isOpen = ref(false)
const selectedValue = ref(props.modelValue)

const selectValue = (value: string) => {
  selectedValue.value = value
  emit('update:modelValue', value)
  isOpen.value = false
}

provide('select', {
  isOpen,
  selectedValue,
  selectValue,
})
</script>
