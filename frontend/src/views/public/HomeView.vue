<template>
  <div>
    <!-- Hero Section with Background -->
    <section class="relative overflow-hidden bg-black py-24 lg:py-32">
      <!-- Video Background -->
      <video
        ref="videoRef"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        class="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>

      <!-- Background Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-black via-orange-950/50 to-black z-1"
      />

      <!-- Animated Background Elements -->
      <div class="absolute inset-0 overflow-hidden z-0">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <!-- Hero Content -->
      <div class="relative mx-auto max-w-7xl px-6 z-10 text-white">
        <div class="mx-auto max-w-3xl text-center">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-500/20 backdrop-blur-sm border border-orange-500/50 px-4 py-2 text-sm font-medium text-orange-100">
            <Sparkles class="h-4 w-4" />
            Modern Attendance Management
          </div>

          <h1 class="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-balance leading-tight">
            Streamline Your Workforce
            <span class="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
              Attendance Management
            </span>
          </h1>

          <p class="mt-6 text-xl leading-8 text-gray-300 text-pretty max-w-2xl mx-auto">
            Track, manage, and analyze employee attendance with powerful role-based dashboards.
            Built for organizations that value efficiency, transparency, and data-driven insights.
          </p>

          <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <router-link
              to="/register"
              class="inline-flex items-center justify-center rounded-lg bg-orange-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-orange-700 transition-all hover:shadow-xl hover:scale-105 transform"
            >
              Start Free Trial
              <ArrowRight class="ml-2 h-5 w-5" />
            </router-link>
            <a
              href="#features"
              class="inline-flex items-center justify-center rounded-lg border-2 border-orange-600 text-white px-8 py-4 text-base font-semibold hover:bg-orange-600/10 transition-all"
            >
              Learn More
            </a>
          </div>

          <!-- Trust Indicators -->
          <div class="mt-12 pt-8 border-t border-orange-500/20">
            <p class="text-sm text-gray-400 mb-4">Trusted by leading organizations worldwide</p>
            <div class="flex items-center justify-center gap-8 flex-wrap">
              <div class="text-center">
                <div class="text-2xl font-bold text-orange-500">5000+</div>
                <div class="text-sm text-gray-400">Active Users</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-orange-500">99.9%</div>
                <div class="text-sm text-gray-400">Uptime SLA</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-orange-500">24/7</div>
                <div class="text-sm text-gray-400">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="relative py-24 bg-orange-500 overflow-hidden">
      <!-- Background decoration -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 right-0 w-96 h-96 bg-black rounded-full blur-3xl opacity-20" />
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-accent-50 rounded-full blur-3xl opacity-20" />
      </div>

      <div class="relative mx-auto max-w-7xl px-6">
        <div class="mx-auto max-w-2xl text-center mb-16">
          <p class="text-sm font-semibold uppercase tracking-widest text-white">Features</p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance">
            Everything you need to manage attendance
          </h2>
          <p class="mt-4 text-lg text-slate-900">
            Powerful tools designed for every role in your organization.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="feature in features" :key="feature.title" class="group relative p-8 rounded-2xl border border-white bg-black hover:border-orange-400 hover:shadow-lg transition-all duration-300">
            <div :class="[feature.iconBg, 'inline-flex rounded-xl p-3 mb-4 group-hover:scale-110 transition-transform']">
              <component :is="feature.icon" :class="feature.iconColor" class="h-6 w-6" />
            </div>
            <h3 class="text-lg font-semibold text-orange-500">{{ feature.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-white">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="relative py-24 bg-gradient-to-br from-slate-50 to-white">
      <div class="mx-auto max-w-7xl px-6">
        <div class="mx-auto max-w-2xl text-center mb-16">
          <p class="text-sm font-semibold uppercase tracking-widest text-primary-600">How it works</p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Get started in minutes
          </h2>
          <p class="mt-4 text-lg text-slate-600">
            A simple, intuitive process to set up your attendance management system.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div v-for="(step, idx) in steps" :key="step.title" class="relative text-center group">
            <!-- Connecting Line -->
            <div v-if="idx < steps.length - 1" class="hidden md:block absolute top-12 left-[60%] right-0 h-0.5 bg-gradient-to-r from-primary-400 to-transparent opacity-30" />

            <div class="relative z-10 mb-4 flex justify-center">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white font-bold text-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                {{ idx + 1 }}
              </div>
            </div>
            <h3 class="text-lg font-semibold text-slate-900">{{ step.title }}</h3>
            <p class="mt-2 text-sm text-slate-600 leading-6">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="relative overflow-hidden py-20">
      <!-- Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-700 to-black z-0" />
      <div class="absolute inset-0 opacity-20" style="background-image: url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern id=%22grid%22 width=%22100%22 height=%22100%22 patternUnits=%22userSpaceOnUse%22%3E%3Cpath d=%22M 100 0 L 0 0 0 100%22 fill=%22none%22 stroke=%22%23000000%22 stroke-width=%220.5%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%23ff6600%22/%3E%3Crect width=%22100%22 height=%22100%22 fill=%22url(%23grid)%22 /%3E%3C/svg%3E'); z-index: 0;" />

      <!-- Content -->
      <div class="relative mx-auto max-w-4xl px-6 text-center z-10">
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
          Ready to transform your attendance management?
        </h2>
        <p class="mt-4 text-xl text-orange-100">
          Join thousands of organizations that trust Attendex for their workforce tracking needs.
          Start your free 14-day trial today with no credit card required.
        </p>
        <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/register"
            class="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-orange-600 shadow-lg hover:bg-orange-50 transition-all hover:shadow-xl hover:scale-105 transform"
          >
            Get Started Today
            <ArrowRight class="ml-2 h-5 w-5" />
          </router-link>
          <a
            href="#features"
            class="inline-flex items-center justify-center rounded-lg border-2 border-white text-white px-8 py-4 text-base font-semibold hover:bg-white/10 transition-all"
          >
            View Features
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Clock, Users, BarChart3, Shield, Zap, Globe,
  ArrowRight, Sparkles,
} from 'lucide-vue-next'

const videoRef = ref(null)

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.play().catch(() => {
      // Handle autoplay policy restrictions
      console.log('Video autoplay failed - user interaction may be required')
    })
  }
})

const features = [
  {
    title: 'Real-Time Check-In/Out',
    description: 'Employees check in and out with a single click. Managers see live attendance status across the organization.',
    icon: Clock,
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary-600',
  },
  {
    title: 'Role-Based Dashboards',
    description: 'Tailored views for employees, organization admins, and super administrators with the data that matters most.',
    icon: Users,
    iconBg: 'bg-accent-50',
    iconColor: 'text-accent-600',
  },
  {
    title: 'Powerful Analytics',
    description: 'Comprehensive reports on attendance trends, working hours, and employee punctuality with visual charts.',
    icon: BarChart3,
    iconBg: 'bg-warning-50',
    iconColor: 'text-warning-600',
  },
  {
    title: 'Enterprise Security',
    description: 'JWT authentication, role-based access control, and encrypted data storage keep your organization secure.',
    icon: Shield,
    iconBg: 'bg-danger-50',
    iconColor: 'text-danger-600',
  },
  {
    title: 'Flexible Subscriptions',
    description: 'Choose a plan that fits your organization. Scale seamlessly as your team grows with transparent pricing.',
    icon: Zap,
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary-600',
  },
  {
    title: 'Multi-Tenant Architecture',
    description: 'Each organization operates in its own secure space with isolated data and customizable settings.',
    icon: Globe,
    iconBg: 'bg-accent-50',
    iconColor: 'text-accent-600',
  },
]

const steps = [
  {
    title: 'Register Your Organization',
    description: 'Create your account and set up your organization profile in under two minutes.',
  },
  {
    title: 'Add Your Team',
    description: 'Invite employees and assign roles. Each person gets their own tailored dashboard.',
  },
  {
    title: 'Track Attendance',
    description: 'Start checking in, viewing reports, and managing your workforce attendance instantly.',
  },
]
</script>
