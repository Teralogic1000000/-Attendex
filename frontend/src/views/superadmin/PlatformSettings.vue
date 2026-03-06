<template>
  <div>
    <AppHeader title="Platform Settings" subtitle="Global system configuration and feature toggles" />
    <div class="p-6 space-y-6">
      <!-- General Settings -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
            <input type="text" value="Attendex" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
            <input type="email" value="support@attendex.io" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
            <input type="tel" value="+1 (555) 123-4567" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Default Organization Limit</label>
            <input type="number" value="50" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      <!-- Feature Toggles -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Feature Toggles</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">GPS Geofencing</p>
              <p class="text-sm text-gray-600">Enable location-based attendance</p>
            </div>
            <div class="relative">
              <input type="checkbox" checked class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-300 peer-checked:bg-primary-600 rounded-full transition-colors"></div>
              <div class="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full peer-checked:translate-x-5 transition-transform"></div>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">QR Code Check-in</p>
              <p class="text-sm text-gray-600">Allow QR code based attendance</p>
            </div>
            <div class="relative">
              <input type="checkbox" checked class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-300 peer-checked:bg-primary-600 rounded-full transition-colors"></div>
              <div class="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full peer-checked:translate-x-5 transition-transform"></div>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">Facial Recognition</p>
              <p class="text-sm text-gray-600">Enable face-based authentication</p>
            </div>
            <div class="relative">
              <input type="checkbox" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-300 peer-checked:bg-primary-600 rounded-full transition-colors"></div>
              <div class="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full peer-checked:translate-x-5 transition-transform"></div>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">Multi-Organization Support</p>
              <p class="text-sm text-gray-600">Allow users to manage multiple orgs</p>
            </div>
            <div class="relative">
              <input type="checkbox" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-300 peer-checked:bg-primary-600 rounded-full transition-colors"></div>
              <div class="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full peer-checked:translate-x-5 transition-transform"></div>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">Advanced Analytics</p>
              <p class="text-sm text-gray-600">Enable AI-powered insights</p>
            </div>
            <div class="relative">
              <input type="checkbox" checked class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-300 peer-checked:bg-primary-600 rounded-full transition-colors"></div>
              <div class="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full peer-checked:translate-x-5 transition-transform"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Email Configuration -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Email Configuration</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
            <input type="text" value="smtp.sendgrid.net" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
              <input type="number" value="587" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sender Email</label>
              <input type="email" value="noreply@attendex.io" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">API Key (masked)</label>
            <input type="password" value="••••••••••••••••••••" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Save Email Settings
          </button>
        </div>
      </div>

      <!-- Integration Keys -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Integration Keys</h3>
        <div class="space-y-4">
          <div class="p-4 border border-gray-200 rounded-lg">
            <p class="text-sm font-medium text-gray-700 mb-2">Twilio API Key</p>
            <div class="flex gap-2">
              <input type="password" value="••••••••••••••••••••" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Rotate
              </button>
            </div>
          </div>
          <div class="p-4 border border-gray-200 rounded-lg">
            <p class="text-sm font-medium text-gray-700 mb-2">Stripe API Key</p>
            <div class="flex gap-2">
              <input type="password" value="••••••••••••••••••••" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Rotate
              </button>
            </div>
          </div>
          <div class="p-4 border border-gray-200 rounded-lg">
            <p class="text-sm font-medium text-gray-700 mb-2">Google Maps API Key</p>
            <div class="flex gap-2">
              <input type="password" value="••••••••••••••••••••" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Rotate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
</script>