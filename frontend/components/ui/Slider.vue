<template>
  <div
    data-slot="slider"
    role="slider"
    :aria-valuenow="Array.isArray(modelValue) ? modelValue[0] : min"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :class="sliderClasses"
    @mousedown="isDragging = true"
    @mouseup="isDragging = false"
    @mouseleave="isDragging = false"
  >
    <div
      data-slot="slider-track"
      class="bg-muted relative grow overflow-hidden rounded-full h-1.5 w-full"
      @mousedown="handleTrackClick"
    >
      <div
        data-slot="slider-range"
        class="bg-primary absolute h-full"
        :style="rangeStyle"
      />
    </div>
    <div
      v-for="(val, idx) in currentValues"
      :key="idx"
      data-slot="slider-thumb"
      class="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 cursor-pointer absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
      :style="{ left: `${((val - min) / (max - min)) * 100}%` }"
      @mousedown="startDrag(idx, $event)"
      @keydown.arrow-right="changeValue(idx, 1)"
      @keydown.arrow-left="changeValue(idx, -1)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue?: number | number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 50,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | number[]]
}>()

const isDragging = ref(false)
const dragIndex = ref(0)

const currentValues = computed(() => {
  const val = props.modelValue
  return Array.isArray(val) ? val : [val]
})

const sliderClasses = computed(() => {
  const base = 'relative flex w-full touch-none items-center select-none h-6 group'
  return `${base} ${props.class || ''}`
})

const rangeStyle = computed(() => {
  const vals = currentValues.value.sort((a, b) => a - b)
  const minPos = ((vals[0] - props.min) / (props.max - props.min)) * 100
  const maxPos = ((vals[vals.length - 1] - props.min) / (props.max - props.min)) * 100
  return {
    left: `${minPos}%`,
    right: `${100 - maxPos}%`,
  }
})

const handleTrackClick = (e: MouseEvent) => {
  if (props.disabled) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const pos = ((e.clientX - rect.left) / rect.width) * (props.max - props.min) + props.min
  const rounded = Math.round(pos / props.step) * props.step
  emit('update:modelValue', rounded)
}

const startDrag = (idx: number, e: MouseEvent) => {
  if (props.disabled) return
  dragIndex.value = idx
  isDragging.value = true

  const startX = e.clientX
  const startValue = currentValues.value[idx]

  const handleMouseMove = (moveEvent: MouseEvent) => {
    const delta = moveEvent.clientX - startX
    const rect = (e.currentTarget as HTMLElement).parentElement!.getBoundingClientRect()
    const ratio = delta / rect.width
    const change = ratio * (props.max - props.min)
    const newValue = Math.round((startValue + change) / props.step) * props.step
    const clamped = Math.max(props.min, Math.min(props.max, newValue))

    const newValues = [...currentValues.value]
    newValues[idx] = clamped
    emit('update:modelValue', newValues.length === 1 ? newValues[0] : newValues)
  }

  const handleMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const changeValue = (idx: number, delta: number) => {
  const newValues = [...currentValues.value]
  newValues[idx] = Math.max(props.min, Math.min(props.max, newValues[idx] + delta * props.step))
  emit('update:modelValue', newValues.length === 1 ? newValues[0] : newValues)
}
</script>
