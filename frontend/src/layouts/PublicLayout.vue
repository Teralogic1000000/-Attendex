<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Public Nav -->
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <router-link to="/" class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm">
            A
          </div>
          <span class="text-xl font-bold text-slate-900 tracking-tight">Attendex</span>
        </router-link>

        <nav class="hidden md:flex items-center gap-8">
          <router-link
            to="/"
            class="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
          >
            Home
          </router-link>
          <a
            href="#features"
            class="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            class="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
          >
            How it Works
          </a>
        </nav>

        <div class="flex items-center gap-3">
          <router-link
            to="/login"
            class="text-sm font-semibold text-slate-700 hover:text-primary-600 transition-colors"
          >
            Sign in
          </router-link>
          <router-link to="/register" class="btn-primary">
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
    <footer class="border-t border-slate-200 bg-slate-50">
      <div class="mx-auto max-w-7xl px-6 py-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2.5">
            <div class="flex h-6 w-6 items-center justify-center rounded bg-primary-600 text-white font-bold text-xs">
              A
            </div>
            <span class="text-sm font-semibold text-slate-700">Attendex</span>
          </div>
          <p class="text-sm text-slate-500">
            &copy; {{ new Date().getFullYear() }} Attendex. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
