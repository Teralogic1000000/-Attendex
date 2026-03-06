<template>
  <div data-slot="accordion" role="region" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'

interface Props {
  modelValue?: string | string[]
  type?: 'single' | 'multiple'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'single',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

const openItems = ref(Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue].filter(Boolean))

const toggleItem = (value: string) => {
  if (props.type === 'single') {
    openItems.value = openItems.value[0] === value ? [] : [value]
  } else {
    const idx = openItems.value.indexOf(value)
    if (idx > -1) {
      openItems.value.splice(idx, 1)
    } else {
      openItems.value.push(value)
    }
  }
  const result = props.type === 'single' ? openItems.value[0] : openItems.value
  emit('update:modelValue', result)
}

provide('accordion', {
  openItems,
  toggleItem,
  type: props.type,
})
</script>
