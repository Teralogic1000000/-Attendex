<template>
  <ToastProvider>
    <div v-for="toast in toasts" :key="toast.id" class="mb-4">
      <Toast :variant="toast.variant">
        <div class="grid gap-1">
          <ToastTitle v-if="toast.title">{{ toast.title }}</ToastTitle>
          <ToastDescription v-if="toast.description">{{ toast.description }}</ToastDescription>
        </div>
        <component v-if="toast.action" :is="toast.action" />
        <ToastClose @close="removeToast(toast.id)" />
      </Toast>
    </div>
    <ToastViewport />
  </ToastProvider>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import ToastProvider from './ToastProvider.vue'
import Toast from './Toast.vue'
import ToastTitle from './ToastTitle.vue'
import ToastDescription from './ToastDescription.vue'
import ToastClose from './ToastClose.vue'
import ToastViewport from './ToastViewport.vue'

const toastProvider = inject<any>('toastProvider')

const toasts = computed(() => toastProvider?.toasts.value || [])

const removeToast = (id: string) => {
  toastProvider?.removeToast(id)
}
</script>
