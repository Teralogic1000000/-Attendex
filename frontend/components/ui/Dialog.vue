<template>
  <div data-slot="dialog" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'

interface Props {
  open?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = ref(props.open)

const setOpen = (value: boolean) => {
  isOpen.value = value
  emit('update:open', value)
}

provide('dialog', {
  isOpen,
  setOpen,
})
</script>
