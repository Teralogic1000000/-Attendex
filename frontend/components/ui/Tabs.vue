<template>
  <div data-slot="tabs" class="flex flex-col gap-2" :class="$attrs.class">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'

interface Props {
  modelValue?: string
  defaultValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  defaultValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = ref(props.modelValue || props.defaultValue)

provide('tabs', {
  activeTab,
  updateTab: (value: string) => {
    activeTab.value = value
    emit('update:modelValue', value)
  },
})
</script>
