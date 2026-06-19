<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-black via-orange-950/50 to-black py-24 lg:py-32">
      <!-- Background SVG Pattern -->
      <div class="absolute inset-0 opacity-20" style="background-image: url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern id=%22grid%22 width=%22100%22 height=%22100%22 patternUnits=%22userSpaceOnUse%22%3E%3Cpath d=%22M 100 0 L 0 0 0 100%22 fill=%22none%22 stroke=%22%23000000%22 stroke-width=%220.5%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%23ff6600%22/%3E%3Crect width=%22100%22 height=%22100%22 fill=%22url(%23grid)%22 /%3E%3C/svg%3E'); z-index: 0;" />
      <div class="mx-auto max-w-7xl px-6 relative z-10">
        <div class="mx-auto max-w-2xl text-center">
          <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            Simple, Transparent Pricing
          </h1>
          <p class="mt-6 text-lg leading-8 text-gray-300 text-pretty">
            Choose the plan that fits your organization. Always scale as you grow, with no hidden fees.
          </p>
        </div>
      </div>
    </section>

    <!-- Pricing Toggle -->
    <section class="py-12 bg-white">
      <div class="mx-auto max-w-7xl px-6">
        <div class="flex justify-center items-center gap-6">
          <span :class="['text-sm font-semibold', billingPeriod === 'monthly' ? 'text-slate-900' : 'text-slate-600']">
            Monthly
          </span>
          <button
            @click="billingPeriod = billingPeriod === 'monthly' ? 'annual' : 'monthly'"
            class="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-200 transition-colors"
            :class="billingPeriod === 'annual' ? 'bg-orange-600' : 'bg-slate-200'"
          >
            <span
              :class="[
                'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                billingPeriod === 'annual' ? 'translate-x-7' : 'translate-x-1',
              ]"
            />
          </button>
          <span :class="['text-sm font-semibold', billingPeriod === 'annual' ? 'text-slate-900' : 'text-slate-600']">
            Annual
            <span class="ml-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
              Save 20%
            </span>
          </span>
        </div>
      </div>
    </section>

    <!-- Pricing Cards -->
    <section class="py-24 bg-white">
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          <!-- Startup Plan -->
          <div class="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-lg transition-all">
            <div class="mb-8">
              <h3 class="text-2xl font-bold text-slate-900">Startup</h3>
              <p class="mt-2 text-sm text-slate-600">Perfect for small teams</p>
            </div>

            <div class="mb-8">
              <span class="text-4xl font-bold text-slate-900">
                ${{ billingPeriod === 'monthly' ? '29' : '279' }}
              </span>
              <span class="text-slate-600">/{{ billingPeriod === 'monthly' ? 'month' : 'year' }}</span>
              <p class="mt-2 text-sm text-slate-600">Up to 25 employees</p>
            </div>

            <router-link to="/register" class="btn-primary w-full py-2.5 text-center font-semibold mb-8">
              Get Started
            </router-link>

            <div class="space-y-4">
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">Up to 25 employees</span>
              </div>
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">Real-time attendance tracking</span>
              </div>
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">Basic reporting</span>
              </div>
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">Email support</span>
              </div>
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">Mobile app access</span>
              </div>
            </div>
          </div>

          <!-- Professional Plan (Featured) -->
          <div class="relative flex flex-col rounded-2xl border-2 border-orange-600 bg-white p-8 shadow-xl hover:shadow-2xl transition-all ring-4 ring-orange-50 lg:scale-105">
            <div class="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              POPULAR
            </div>

            <div class="mb-8">
              <h3 class="text-2xl font-bold text-slate-900">Professional</h3>
              <p class="mt-2 text-sm text-slate-600">For growing teams</p>
            </div>

            <div class="mb-8">
              <span class="text-4xl font-bold text-slate-900">
                ${{ billingPeriod === 'monthly' ? '79' : '758' }}
              </span>
              <span class="text-slate-600">/{{ billingPeriod === 'monthly' ? 'month' : 'year' }}</span>
              <p class="mt-2 text-sm text-slate-600">Up to 100 employees</p>
            </div>

            <router-link to="/register" class="btn-primary w-full py-2.5 text-center font-semibold mb-8">
              Get Started
            </router-link>

            <div class="space-y-4">
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">Up to 100 employees</span>
              </div>
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">Advanced analytics</span>
              </div>
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">Department & shift management</span>
              </div>
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">Priority support</span>
              </div>
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">Custom branding</span>
              </div>
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">API access</span>
              </div>
            </div>
          </div>

          <!-- Enterprise Plan -->
          <div class="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-lg transition-all">
            <div class="mb-8">
              <h3 class="text-2xl font-bold text-slate-900">Enterprise</h3>
              <p class="mt-2 text-sm text-slate-600">For large organizations</p>
            </div>

            <div class="mb-8">
              <span class="text-4xl font-bold text-slate-900">Custom</span>
              <p class="mt-2 text-sm text-slate-600">Unlimited employees</p>
            </div>

            <a href="mailto:sales@attendex.com" class="group inline-flex items-center justify-center w-full rounded-lg border-2 border-slate-200 px-6 py-2.5 text-base font-semibold text-slate-700 hover:border-primary-600 hover:text-primary-600 transition-colors mb-8">
              Contact Sales
              <svg class="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>

            <div class="space-y-4">
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">Unlimited employees</span>
              </div>
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">White-label solution</span>
              </div>
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">Dedicated account manager</span>
              </div>
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">Advanced integrations</span>
              </div>
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">SLA guarantee</span>
              </div>
              <div class="flex gap-3 items-start">
                <svg class="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-slate-700">On-premise deployment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-24 bg-slate-50">
      <div class="mx-auto max-w-3xl px-6">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div class="space-y-8">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Can I change plans anytime?</h3>
            <p class="mt-2 text-slate-600">
              Yes, you can upgrade or downgrade your plan anytime. Changes take effect at your next billing cycle. If you upgrade, you'll be prorated for the difference.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-slate-900">Do you offer discounts for annual billing?</h3>
            <p class="mt-2 text-slate-600">
              Yes! Annual billing saves you 20% compared to monthly pricing. This applies to all plans.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-slate-900">What about data security?</h3>
            <p class="mt-2 text-slate-600">
              All data is encrypted in transit and at rest. We comply with GDPR, CCPA, and SOC 2 Type II standards for maximum security.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-slate-900">Is there a free trial?</h3>
            <p class="mt-2 text-slate-600">
              Yes, you can try any plan free for 14 days. No credit card required to start your trial.
            </p>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-slate-900">What support is included?</h3>
            <p class="mt-2 text-slate-600">
              Startup and Professional plans include email support. Enterprise plans include 24/7 phone and email support with a dedicated account manager.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-gradient-to-r from-orange-600 to-orange-700 py-20">
      <div class="mx-auto max-w-4xl px-6 text-center">
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
          Ready to get started?
        </h2>
        <p class="mt-4 text-lg text-orange-100">
          Try Attendex free for 14 days. No credit card required.
        </p>
        <router-link
          to="/register"
          class="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-orange-600 shadow-sm hover:bg-orange-50 transition-colors"
        >
          Start Free Trial
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const billingPeriod = ref('monthly')
</script>
