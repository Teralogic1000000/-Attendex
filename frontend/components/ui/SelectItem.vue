<template>
  <button type="button" data-slot="select-item" class="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" @click="selectValue" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { inject } from 'vue'

interface Props {
  value: string
}

const props = defineProps<Props>()

const select = inject<any>('select')

const selectValue = () => {
  select?.selectValue(props.value)
}
</script>
