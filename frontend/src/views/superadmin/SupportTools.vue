<template>
  <div>
    <AppHeader title="Support Tools" subtitle="Administrative controls for platform operations" />
    <div class="p-6 space-y-6">
      <!-- Critical Actions Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Force Password Reset -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-warning-100 rounded-lg">
              <Lock class="w-5 h-5 text-warning-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Force Password Reset</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">Force a user to reset their password on next login</p>
          <div class="space-y-3">
            <input type="email" placeholder="User email address..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warning-500 focus:border-transparent" />
            <button class="w-full px-4 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 transition-colors">
              Force Password Reset
            </button>
          </div>
        </div>

        <!-- Suspend Organization -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-danger-100 rounded-lg">
              <Ban class="w-5 h-5 text-danger-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Suspend Organization</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">Immediately suspend an organization account</p>
          <div class="space-y-3">
            <input type="text" placeholder="Organization name..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-danger-500 focus:border-transparent" />
            <textarea placeholder="Reason for suspension..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-danger-500 focus:border-transparent resize-none" rows="2"></textarea>
            <button class="w-full px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors">
              Suspend Organization
            </button>
          </div>
        </div>

        <!-- Reset Organization Data -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-danger-100 rounded-lg">
              <RotateCw class="w-5 h-5 text-danger-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Reset Organization Data</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">Wipe all attendance and employee records (irreversible)</p>
          <div class="space-y-3">
            <input type="text" placeholder="Organization name..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-danger-500 focus:border-transparent" />
            <div class="flex items-center gap-2">
              <input type="checkbox" id="confirm-reset" />
              <label for="confirm-reset" class="text-sm text-gray-600">I understand this is permanent</label>
            </div>
            <button class="w-full px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors disabled:opacity-50" disabled>
              Reset All Data
            </button>
          </div>
        </div>

        <!-- Broadcast Announcement -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-accent-100 rounded-lg">
              <Megaphone class="w-5 h-5 text-accent-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Broadcast Announcement</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">Send system-wide announcement to all organizations</p>
          <div class="space-y-3">
            <input type="text" placeholder="Announcement title..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
            <textarea placeholder="Message..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none" rows="3"></textarea>
            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500">
              <option>All Organizations</option>
              <option>Free Tier Only</option>
              <option>Pro Tier Only</option>
              <option>Enterprise Only</option>
            </select>
            <button class="w-full px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors">
              Send Announcement
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Actions Log -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Support Actions</h3>
        <div class="space-y-3 max-h-96 overflow-y-auto">
          <div class="flex items-start gap-3 pb-3 border-b">
            <Lock class="w-5 h-5 text-warning-600 flex-shrink-0 mt-1" />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900">Password Reset Forced</p>
              <p class="text-sm text-gray-600">user@techcorp.com - 2 hours ago</p>
            </div>
          </div>
          <div class="flex items-start gap-3 pb-3 border-b">
            <Ban class="w-5 h-5 text-danger-600 flex-shrink-0 mt-1" />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900">Organization Suspended</p>
              <p class="text-sm text-gray-600">GlobalVentures Inc. - 4 hours ago</p>
            </div>
          </div>
          <div class="flex items-start gap-3 pb-3 border-b">
            <Megaphone class="w-5 h-5 text-accent-600 flex-shrink-0 mt-1" />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900">Announcement Sent</p>
              <p class="text-sm text-gray-600">"System Maintenance 3-5 PM EST" to All Orgs - 1 day ago</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <RotateCw class="w-5 h-5 text-danger-600 flex-shrink-0 mt-1" />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900">Organization Data Reset</p>
              <p class="text-sm text-gray-600">DataFlow Systems - 3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Lock, Ban, RotateCw, Megaphone } from 'lucide-vue-next'
import AppHeader from '@/components/common/AppHeader.vue'
</script>