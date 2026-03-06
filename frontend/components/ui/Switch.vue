<template>
  <button
    data-slot="switch"
    role="switch"
    :aria-checked="modelValue"
    type="button"
    :class="switchClasses"
    :disabled="disabled"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <div
      data-slot="switch-thumb"
      :class="thumbClasses"
    />
  </button>
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

const switchClasses = computed(() => {
  const base = 'peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50'
  const stateClass = props.modelValue ? 'bg-primary' : 'bg-input dark:bg-input/80'
  return `${base} ${stateClass} ${props.class || ''}`
})

const thumbClasses = computed(() => {
  const base = 'bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform'
  const translateClass = props.modelValue ? 'translate-x-[calc(100%-2px)]' : 'translate-x-0'
  return `${base} ${translateClass}`
})
</script>
