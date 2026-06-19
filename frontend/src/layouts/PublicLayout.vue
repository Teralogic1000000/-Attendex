<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Public Nav -->
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-black/90 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <router-link to="/" class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white font-bold text-sm">
            T
          </div>
          <span class="text-xl font-bold text-orange-500 tracking-tight">TrackTimi</span>
        </router-link>

        <nav class="hidden md:flex items-center gap-8">
          <router-link
            to="/"
            class="text-sm font-medium text-white hover:text-orange-600 transition-colors"
          >
            Home
          </router-link>
          <a
            href="#features"
            class="text-sm font-medium text-white hover:text-orange-600 transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            class="text-sm font-medium text-white hover:text-orange-600 transition-colors"
          >
            How it Works
          </a>
          <router-link
            to="/about"
            class="text-sm font-medium text-white hover:text-orange-600 transition-colors"
          >
            About
          </router-link>
          <router-link
            to="/pricing"
            class="text-sm font-medium text-white hover:text-orange-600 transition-colors"
          >
            Pricing
          </router-link>
          <router-link
            to="/contact"
            class="text-sm font-medium text-white hover:text-orange-600 transition-colors"
          >
            Contact
          </router-link>
        </nav>

        <div class="flex items-center gap-3">
          <router-link
            to="/login"
            class="text-sm font-semibold text-white hover:text-orange-600 transition-colors"
          >
            Sign in
          </router-link>
          <router-link to="/register" class="btn-primary bg-orange-500 text-sm py-2">
            Get Started
          </router-link>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup>
import AppFooter from '@/components/common/AppFooter.vue'
</script>
