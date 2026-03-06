<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-black via-orange-950/50 to-black py-24 lg:py-32">
      <div class="mx-auto max-w-7xl px-6">
        <div class="mx-auto max-w-2xl text-center">
          <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            Contact Us
          </h1>
          <p class="mt-6 text-lg leading-8 text-gray-300 text-pretty">
            Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-24 bg-white">
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          <!-- Contact Info -->
          <div>
            <h3 class="text-lg font-semibold text-slate-900 mb-6">Get in Touch</h3>
            <div class="space-y-6">
              <div class="flex gap-4">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-10 w-10 rounded-md bg-primary-600 text-white">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 class="text-base font-semibold text-slate-900">Email</h4>
                  <p class="mt-1 text-slate-600">
                    <a href="mailto:support@attendex.com" class="hover:text-primary-600 transition-colors">
                      support@attendex.com
                    </a>
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-10 w-10 rounded-md bg-primary-600 text-white">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 class="text-base font-semibold text-slate-900">Phone</h4>
                  <p class="mt-1 text-slate-600">
                    <a href="tel:+1234567890" class="hover:text-primary-600 transition-colors">
                      +1 (234) 567-890
                    </a>
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-10 w-10 rounded-md bg-primary-600 text-white">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 class="text-base font-semibold text-slate-900">Office Address</h4>
                  <p class="mt-1 text-slate-600">
                    123 Tech Street<br/>
                    San Francisco, CA 94105<br/>
                    United States
                  </p>
                </div>
              </div>

              <div class="flex gap-4 pt-4">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-10 w-10 rounded-md bg-primary-600 text-white">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 class="text-base font-semibold text-slate-900">Business Hours</h4>
                  <p class="mt-1 text-slate-600">
                    Monday - Friday: 9:00 AM - 6:00 PM<br/>
                    Saturday - Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="lg:col-span-2">
            <form @submit.prevent="submitForm" class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-slate-700 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    v-model="formData.firstName"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium text-slate-700 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    v-model="formData.lastName"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label for="subject" class="block text-sm font-medium text-slate-700 mb-1">
                  Subject
                </label>
                <input
                  id="subject"
                  v-model="formData.subject"
                  type="text"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div>
                <label for="message" class="block text-sm font-medium text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  v-model="formData.message"
                  rows="5"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder="Tell us more about your inquiry..."
                  required
                />
              </div>

              <div class="flex items-start gap-3">
                <input
                  id="consent"
                  v-model="formData.consent"
                  type="checkbox"
                  class="mt-1"
                  required
                />
                <label for="consent" class="text-sm text-slate-600">
                  I agree to the privacy policy and consent to be contacted by the Attendex team.
                </label>
              </div>

              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSubmitting ? 'Sending...' : 'Send Message' }}
              </button>

              <!-- Success Message -->
              <transition
                name="fade"
                @enter="onEnter"
                @leave="onLeave"
              >
                <div v-if="showSuccess" class="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
                  Thank you for your message! We'll get back to you shortly.
                </div>
              </transition>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  subject: '',
  message: '',
  consent: false,
})

const isSubmitting = ref(false)
const showSuccess = ref(false)

const submitForm = async () => {
  isSubmitting.value = true

  try {
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Reset form
    Object.keys(formData.value).forEach(key => {
      if (typeof formData.value[key] === 'boolean') {
        formData.value[key] = false
      } else {
        formData.value[key] = ''
      }
    })

    // Show success message
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 5000)
  } finally {
    isSubmitting.value = false
  }
}

const onEnter = (el) => {
  el.style.opacity = '0'
  setTimeout(() => {
    el.style.transition = 'opacity 0.3s'
    el.style.opacity = '1'
  })
}

const onLeave = (el) => {
  el.style.transition = 'opacity 0.3s'
  el.style.opacity = '0'
}
</script>
