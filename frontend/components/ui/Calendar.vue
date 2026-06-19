<template>
  <div data-slot="calendar" class="p-3 text-center" :class="$attrs.class">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <button @click="previousMonth" class="px-2 py-1 hover:bg-accent rounded">←</button>
        <span class="font-semibold">{{ monthYear }}</span>
        <button @click="nextMonth" class="px-2 py-1 hover:bg-accent rounded">→</button>
      </div>
      <div class="grid grid-cols-7 gap-2">
        <div v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="day" class="text-xs font-medium text-muted-foreground">
          {{ day }}
        </div>
        <button
          v-for="day in days"
          :key="day"
          :disabled="!day"
          class="text-sm p-2 hover:bg-accent rounded disabled:opacity-0"
          :class="{ 'bg-primary text-primary-foreground': day === selectedDay }"
          @click="selectDate(day)"
        >
          {{ day }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue?: Date
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => new Date(),
})

const emit = defineEmits<{
  'update:modelValue': [value: Date]
}>()

const currentDate = ref(new Date(props.modelValue))
const selectedDay = ref(props.modelValue?.getDate() || new Date().getDate())

const monthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const days = computed(() => {
  const date = new Date(currentDate.value)
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const daysArray = Array(firstDay).fill(0).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))
  return daysArray
})

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}

const selectDate = (day: number) => {
  if (day) {
    const newDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
    selectedDay.value = day
    emit('update:modelValue', newDate)
  }
}
</script>
