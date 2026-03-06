<template>
  <div class="flex h-screen bg-slate-50">
    <!-- Sidebar -->
    <Sidebar :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Navbar -->
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Content Area -->
      <main class="flex-1 overflow-auto">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import Navbar from '@/components/layout/Navbar.vue'

const sidebarOpen = ref(true)
</script>
