<template>
  <div data-slot="tabs-content" class="flex-1 outline-none" :class="$attrs.class" v-show="isActive">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

interface Props {
  value: string
}

const props = defineProps<Props>()

const tabs = inject<any>('tabs')

const isActive = computed(() => tabs?.activeTab.value === props.value)
</script>
