<template>
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-40 flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" aria-hidden="true" />
        <div
          :class="sizeClass"
          class="relative w-full bg-white rounded-xl shadow-2xl ring-1 ring-slate-950/5 overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
            <button
              @click="$emit('close')"
              class="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X class="h-5 w-5" />
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <div class="px-6 py-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
            <slot />
          </div>
          <div v-if="$slots.footer" class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' },
})

defineEmits(['close'])

const sizeClass = computed(() => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }
  return sizes[props.size] || sizes.md
})
</script>

<style scoped>
.modal-enter-active {
  transition: all 0.3s ease-out;
}
.modal-leave-active {
  transition: all 0.2s ease-in;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
