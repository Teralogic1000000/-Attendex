<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-white">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50/30" aria-hidden="true" />
      <div class="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div class="mx-auto max-w-2xl text-center">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 ring-1 ring-inset ring-primary-200">
            <Sparkles class="h-4 w-4" />
            Modern Attendance Management
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl text-balance">
            Streamline Your Workforce
            <span class="text-amber-600">Attendance</span>
          </h1>
          <p class="mt-6 text-lg leading-8 text-slate-600 text-pretty">
            Track, manage, and analyze employee attendance with powerful role-based dashboards.
            Built for organizations that value efficiency and transparency.
          </p>
          <div class="mt-10 flex items-center justify-center gap-4">
            <router-link
              to="/register"
              class="btn-primary"
            >
              Start Free Trial
              <ArrowRight class="ml-2 h-4 w-4" />
            </router-link>
            <a
              href="#features"
              class="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-primary-600 ring-1 ring-inset ring-primary-200 hover:bg-primary-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="bg-white py-24">
      <div class="mx-auto max-w-7xl px-6">
        <div class="mx-auto max-w-2xl text-center mb-16">
          <p class="text-sm font-semibold uppercase tracking-widest text-primary-600">Features</p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance">
            Everything you need to manage attendance
          </h2>
          <p class="mt-4 text-lg text-slate-600">
            Powerful tools designed for every role in your organization.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="feature in features" :key="feature.title" class="card p-8 hover:shadow-md transition-shadow">
            <div :class="feature.iconBg" class="inline-flex rounded-lg p-3 mb-4">
              <component :is="feature.icon" :class="feature.iconColor" class="h-6 w-6" />
            </div>
            <h3 class="text-lg font-semibold text-slate-900">{{ feature.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="bg-slate-50 py-24">
      <div class="mx-auto max-w-7xl px-6">
        <div class="mx-auto max-w-2xl text-center mb-16">
          <p class="text-sm font-semibold uppercase tracking-widest text-primary-600">How it works</p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Get started in minutes
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div v-for="(step, idx) in steps" :key="step.title" class="relative text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white font-bold text-lg">
              {{ idx + 1 }}
            </div>
            <h3 class="text-lg font-semibold text-slate-900">{{ step.title }}</h3>
            <p class="mt-2 text-sm text-slate-600">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-primary-600 py-20">
      <div class="mx-auto max-w-4xl px-6 text-center">
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
          Ready to transform your attendance management?
        </h2>
        <p class="mt-4 text-lg text-primary-100">
          Join organizations that trust Attendex for their workforce tracking needs.
        </p>
        <router-link
          to="/register"
          class="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-primary-600 shadow-sm hover:bg-primary-50 transition-colors cursor-pointer"
        >
          Get Started Today
          <ArrowRight class="ml-2 h-4 w-4" />
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  Clock, Users, BarChart3, Shield, Zap, Globe,
  ArrowRight, Sparkles,
} from 'lucide-vue-next'

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
